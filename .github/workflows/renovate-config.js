module.exports = {
	branchPrefix: 'renovate/',
	username: 'renovate-release',
	gitAuthor: 'Renovate Bot <bot@renovateapp.com>',
	onboarding: false,
	platform: 'github',
	includeForks: true,
	packageRules: [
		{
			matchDepTypes: ['devDependencies'],
			automerge: true,
			postUpdateOptions: ['pnpmDedupe']
		}
	]
};