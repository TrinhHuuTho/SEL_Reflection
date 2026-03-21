const EmailJob = require('../models/EmailJob');
const transporter = require('../config/email');

const MAX_ATTEMPTS = 5;
const POLL_INTERVAL_MS = 5000; 
const BATCH_SIZE = 10;

async function processPendingJobs() {
  try {
    const jobs = await EmailJob.find({
      status: 'pending',
      attempts: { $lt: MAX_ATTEMPTS }
    })
      .sort({ createdAt: 1 })
      .limit(BATCH_SIZE);

    if (!jobs.length) return;

    for (const job of jobs) {
      const lockedJob = await EmailJob.findOneAndUpdate(
        { _id: job._id, status: 'pending' },
        { $set: { status: 'processing', lastAttemptAt: new Date() } },
        { new: true }
      );

      if (!lockedJob) continue;

      try {
        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: lockedJob.to,
          subject: lockedJob.subject,
          html: lockedJob.html
        });

        lockedJob.status = 'sent';
        lockedJob.attempts += 1;
        await lockedJob.save();
      } catch (sendError) {
        const shouldFail = lockedJob.attempts + 1 >= MAX_ATTEMPTS;
        await EmailJob.findByIdAndUpdate(lockedJob._id, {
          $inc: { attempts: 1 },
          $set: {
            status: shouldFail ? 'failed' : 'pending',
            lastError: sendError.message,
            lastAttemptAt: new Date()
          }
        });
        console.error('Email job failed:', sendError.message);
      }
    }
  } catch (error) {
    console.error('Email worker encountered an error:', error);
  }
}

function startEmailWorker() {
  processPendingJobs();
  setInterval(processPendingJobs, POLL_INTERVAL_MS);
}

module.exports = { startEmailWorker };
