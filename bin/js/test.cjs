const { exec } = require('child_process');

// Define the commands
const commands = [
  'echo hei',
  'echo på deg',
  'echo igjen',
  'echo hei på deg igjen',
];

// Function to execute the commands
function runCommands(commands) {
  commands.forEach(command => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error executing command: ${command}`);
        console.error(stderr);
      } else {
        console.log(`Command executed successfully: ${command}`);
        console.log(stdout);
      }
    });
  });
}

// Run the commands
runCommands(commands);
