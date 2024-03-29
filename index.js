const core = require('@actions/core');
const github = require('@actions/github');
const { Client } = require('ssh2');
const {issue} = require("@actions/core/lib/command");

const main = async() => {
    try {
        const host = core.getInput('ssh-host');
        const port = core.getInput('ssh-port');
        const username = core.getInput('ssh-user');
        const password = core.getInput('ssh-pwd');
        const script = core.getInput('ssh-script');

        const token = core.getInput('token', { required: true });
        const octokit = new github.getOctokit(token);

        const issue_number = github.context.payload.issue.number;
        const {owner, repo} = github.context.repo;

        function createComment(body) {
            octokit.rest.issues.createComment({
                owner,
                repo,
                issue_number: issue_number,
                body: body
            });
        }

        const pr = await octokit.rest.pulls.get({
            owner: owner,
            repo: repo,
            pull_number: issue_number
        });

        var commandPattern = /^\.deploy\s*/;
        var triggerComment = github.context.payload.comment.body;
        if(commandPattern.test(triggerComment)) {
            createComment(`### Deployment Triggered 🚀
__${github.context.actor}__, started a deployment to SSH !
You can watch the progress [here](https://github.com/${github.context.repo.owner}/${github.context.repo.repo}/actions/runs/${process.env.GITHUB_RUN_ID}) 🔗
> Branch: \`${pr?.data?.base?.ref}\``);
            var paramString = triggerComment.replace(commandPattern, '');
            if(/(-\w* \S*)\s*/g.test(paramString) === false && paramString !== '') {
                createComment('👮 Due to security policy, you can only use parameters this way : `-param1 value1 -param2 value2...`')
            } else {
                const conn = new Client();
                conn.on('ready', () => {
                    console.log('SSH client :: ready');
                    conn.exec(script+' '+paramString, (err, stream) => {
                        if (err) throw err;
                        stream.on('data', (data) => {
                            console.log('STDOUT: ' + data);
                            createComment('ok');
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
            }
        }




    } catch(error) {
        core.setFailed(error.message)
    }

}

main();



