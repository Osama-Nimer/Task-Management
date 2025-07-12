export const isValidRepoLink = (link: string): boolean => {
    const httpsRegex = /^https:\/\/github\.com\/[^\/]+\/[^\/]+\/?$/;
    const sshRegex = /^git@github\.com:([^\/]+)\/(.+?)(\.git)?$/;
    return httpsRegex.test(link) || sshRegex.test(link);
}