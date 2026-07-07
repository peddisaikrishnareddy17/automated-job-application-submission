const { spawnSync } = require('child_process');
const path = require('path');

function run(cmd, args, options = {}) {
  const res = spawnSync(cmd, args, { stdio: 'inherit', ...options });
  if (res.error) throw res.error;
  if (res.status !== 0) throw new Error(`Command failed: ${cmd} ${args.join(' ')}`);
}

(async () => {
  try {
    const [,, username, pat, remoteRepo] = process.argv;
    if (!username || !pat || !remoteRepo) {
      console.error('Usage: node push_with_pat.js <username> <pat> <remote-repo-url>');
      process.exit(1);
    }
    const git = path.join('C:', 'Program Files', 'Git', 'cmd', 'git.exe');
    const cwd = process.cwd();

    // show current short sha
    const sha = spawnSync(git, ['rev-parse', '--short', 'HEAD'], { cwd, encoding: 'utf8' });
    if (sha.error) throw sha.error;
    console.log('Current commit:', sha.stdout.trim());

    const remoteWithCreds = remoteRepo.replace('https://', `https://${username}:${pat}@`);

    // set remote to include PAT
    run(git, ['remote', 'set-url', 'origin', remoteWithCreds], { cwd });

    // push main
    run(git, ['push', '-u', 'origin', 'main'], { cwd });

    // restore remote to clean URL (no creds)
    run(git, ['remote', 'set-url', 'origin', remoteRepo], { cwd });

    console.log('Pushed successfully');
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
})();
