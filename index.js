const core = require('@actions/core');
const github = require('@actions/github');
const { Client } = require('ssh2');

const main = async() => {
    try {
        const host = core.getInput('ssh-host');
        const username = core.getInput('ssh-user');
        const password = core.getInput('ssh-pwd');

        const token = core.getInput('token', { required: true });
        const octokit = new github.getOctokit(token);

        const body = github.context.payload.comment.body.trim();
        const issue_number = github.context.payload.issue.number;
        const {owner, repo} = github.context.repo;

        const conn = new Client();
        conn.on('ready', () => {
            console.log('Client :: ready');
            conn.exec('uptime', (err, stream) => {
                if (err) throw err;
                stream.on('close', (code, signal) => {
                    console.log('Stream :: close :: code: ' + code + ', signal: ' + signal);
                    conn.end();
                }).on('data', (data) => {
                    console.log('STDOUT: ' + data);
                    octokit.rest.issues.createComment({
                        owner,
                        repo,
                        issue_number: issue_number,
                        body: `ceci
                        est un test`
                    });
                }).stderr.on('data', (data) => {
                    console.log('STDERR: ' + data);
                    core.setFailed(data)
                });
            });
        }).connect({
            host: host,
            port: port,
            username: username,
            password: password
        });


    } catch(error) {
        core.setFailed(error.message)
    }

}

main();



