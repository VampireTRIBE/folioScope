const COLORS = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  dim: "\x1b[2m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  white: "\x1b[37m",
};

function getTimestamp() {
  const now = new Date();
  const date = now.toISOString().split("T")[0];
  const time = now.toTimeString().split(" ")[0];
  return `[${date} ${time}]`;
}

const log = {
  success: (msg) => {
    console.log(
      `${COLORS.green}${getTimestamp()} ✅ SUCCESS : ${COLORS.reset}${msg}`,
    );
  },
  error: (msg) => {
    console.error(
      `${COLORS.red}${getTimestamp()} ❌ ERROR   : ${COLORS.reset}${msg}`,
    );
  },
  running: (msg) => {
    console.log(
      `${COLORS.blue}${getTimestamp()} ⚙️ RUNNING : ${COLORS.reset}${msg}`,
    );
  },
  waiting: (msg) => {
    console.log(
      `${COLORS.yellow}${getTimestamp()} ⏳ WAITING : ${COLORS.reset}${msg}`,
    );
  },
  info: (msg) => {
    console.log(
      `${COLORS.cyan}${getTimestamp()} ℹ️ INFO    : ${COLORS.reset}${msg}`,
    );
  },
  done: (msg) => {
    console.log(
      `${COLORS.magenta}${getTimestamp()} 🏁 DONE    : ${COLORS.reset}${msg}`,
    );
  },
};

module.exports = log;
