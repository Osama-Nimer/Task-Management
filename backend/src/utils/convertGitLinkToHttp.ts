export const convertGitLinkToHttp = (gitUrl: string): string => {
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