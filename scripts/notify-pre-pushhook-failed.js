const os = require('os');
const { exec } = require('child_process');
const platform = os.platform();
const notification = {
    title: 'There are failing tests in PPL!',
    text: 'Push aborted!',
}

const message = `
▗▖  ▗▖ ▗▄▖▗▄▄▄▖▗▖ ▗▖▗▄▄▄▖▗▖  ▗▖ ▗▄▄▖    ▗▖ ▗▖ ▗▄▖  ▗▄▄▖    ▗▄▄▖ ▗▖ ▗▖ ▗▄▄▖▗▖ ▗▖▗▄▄▄▖▗▄▄▄
▐▛▚▖▐▌▐▌ ▐▌ █  ▐▌ ▐▌  █  ▐▛▚▖▐▌▐▌       ▐▌ ▐▌▐▌ ▐▌▐▌       ▐▌ ▐▌▐▌ ▐▌▐▌   ▐▌ ▐▌▐▌   ▐▌  █
▐▌ ▝▜▌▐▌ ▐▌ █  ▐▛▀▜▌  █  ▐▌ ▝▜▌▐▌▝▜▌    ▐▌ ▐▌▐▛▀▜▌ ▝▀▚▖    ▐▛▀▘ ▐▌ ▐▌ ▝▀▚▖▐▛▀▜▌▐▛▀▀▘▐▌  █
▐▌  ▐▌▝▚▄▞▘ █  ▐▌ ▐▌▗▄█▄▖▐▌  ▐▌▝▚▄▞▘    ▐▙█▟▌▐▌ ▐▌▗▄▄▞▘    ▐▌   ▝▚▄▞▘▗▄▄▞▘▐▌ ▐▌▐▙▄▄▖▐▙▄▄▀
`;

console.error(message);

if (platform === 'darwin') {
    exec(`osascript -e 'display notification "${notification.title}" with title "${notification.text}" sound name "Submarine"'`);
} else if (platform === 'linux') {
    exec(`notify-send "${notification.title}" "${notification.text}"`);
}