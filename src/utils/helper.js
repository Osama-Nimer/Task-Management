export function generateVerificationCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

export function isValidRepoLink(link) {
    const httpsRegex = /^https:\/\/github\.com\/[^\/]+\/[^\/]+\/?$/;
    const sshRegex = /^git@github\.com:([^\/]+)\/(.+?)(\.git)?$/;
    return httpsRegex.test(link) || sshRegex.test(link);
}

export function convertGitLinkToHttp(gitUrl) {
    const httpsRegex = /^https:\/\/github\.com\/[^\/]+\/[^\/]+\/?$/;
    const sshRegex = /^git@github\.com:([^\/]+)\/(.+?)(\.git)?$/;

    if (httpsRegex.test(gitUrl)) {
        return gitUrl;
    }

    const match = gitUrl.match(sshRegex);
    if (match) {
        const user = match[1];
        const repo = match[2];
        return `https://github.com/${user}/${repo}`;
    }

    return gitUrl; 
}
