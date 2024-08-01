// pages/api/recognize.js
import { exec } from 'child_process';

export default function handler(req, res) {
  if (req.method === 'POST') {
    exec('python3 /path/to/your/face-recog-attendance.py', (error, stdout, stderr) => {
      if (error) {
        console.error(`Error executing script: ${error}`);
        return res.status(500).json({ error: 'Internal Server Error' });
      }
      if (stderr) {
        console.error(`Script error: ${stderr}`);
        return res.status(500).json({ error: 'Internal Server Error' });
      }
      console.log(`Script output: ${stdout}`);
      res.status(200).json({ message: 'Attendance recorded', data: stdout });
    });
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
