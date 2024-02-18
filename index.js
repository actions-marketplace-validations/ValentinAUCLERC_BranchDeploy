const core = require('@actions/core');
const github = require('@actions/github');
const { Client } = require('ssh2');

const main = async() => {
    try {
        const host = core.getInput('ssh-host');
        const port = core.getInput('ssh-port');
        const username = core.getInput('ssh-user');
        const password = core.getInput('ssh-pwd');

        const token = core.getInput('token', { required: true });
        const octokit = new github.getOctokit(token);

        const body = github.context.payload.comment.body.trim();
        const issue_number = github.context.payload.issue.number;
        const {owner, repo} = github.context.repo;

        const conn = new Client();
        conn.on('ready', () => {
            console.log('SSH client :: ready');
            conn.exec('./deploy.sh', (err, stream) => {
                if (err) throw err;
                stream.on('data', (data) => {
                    console.log('STDOUT: ' + data);
                    octokit.rest.issues.createComment({
                        owner,
                        repo,
                        issue_number: issue_number,
                        body: `ceci
                        est un test`
                    });
                }).on('close', (code) => {
                    console.log('stream :: close\n', { code });
                    conn.end();
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



