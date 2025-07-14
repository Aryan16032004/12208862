import axios from 'axios';

async function Log(stack, level, pkg, message) {
  try {
    const response = await axios.post(process.env.LOGGING_API, {
      stack,
      level,
      package: pkg,
      message,
    });
    return response.data;
  } catch (err) {
    console.error("Logging failed:", err.message);
  }
}

export default Log;
