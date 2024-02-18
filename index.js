const core = require('@actions/core');
const github = require('@actions/github');

const main = async() => {
    try {
        const host = core.getInput('ssh-host');
        const username = core.getInput('ssh-user');
        const password = core.getInput('ssh-pwd');

        const token = core.getInput('token', { required: true });
        const octokit = new github.getOctokit(token);

        const body = github.context.payload.comment.body.trim()
        const issue_number = github.context.payload.issue.number
        const {owner, repo} = github.context.repo

        await octokit.rest.issues.createComment({
            owner,
            repo,
            issue_number: issue_number,
            body: `
                    test \n
                  `
        })


    } catch(error) {
        core.setFailed(error.message)
    }

}

main();



