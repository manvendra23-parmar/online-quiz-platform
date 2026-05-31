const fs = require('fs');
const csv = require('csv-parser');
const db = require('../config/db');

// @desc    Bulk upload questions via CSV
// @route   POST /api/quizzes/:id/bulk-upload
// @access  Private/Admin
async function bulkUploadQuestions(req, res) {
  const quizId = req.params.id;
  
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'Please upload a CSV file' });
  }
  
  const filePath = req.file.path;
  const questionsToInsert = [];
  
  try {
    // 1. Verify quiz exists
    const [quizzes] = await db.query('SELECT title FROM quizzes WHERE id = ?', [quizId]);
    if (!quizzes || quizzes.length === 0) {
      fs.unlinkSync(filePath); // Delete file
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }
    
    // 2. Parse CSV
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => {
        // Map keys to be case-insensitive and trimmed
        const questionText = row.question_text || row.question || row.QuestionText;
        const optionA = row.option_a || row.optionA || row.OptionA;
        const optionB = row.option_b || row.optionB || row.OptionB;
        const optionC = row.option_c || row.optionC || row.OptionC;
        const optionD = row.option_d || row.optionD || row.OptionD;
        const correctOption = row.correct_option || row.correctOption || row.CorrectOption;
        const explanation = row.explanation || row.Explanation || '';
        
        // Validate record
        if (questionText && optionA && optionB && optionC && optionD && correctOption) {
          const cleanCorrect = correctOption.trim().toUpperCase();
          if (['A', 'B', 'C', 'D'].includes(cleanCorrect)) {
            questionsToInsert.push({
              quizId,
              questionText: questionText.trim(),
              optionA: optionA.trim(),
              optionB: optionB.trim(),
              optionC: optionC.trim(),
              optionD: optionD.trim(),
              correctOption: cleanCorrect,
              explanation: explanation.trim()
            });
          }
        }
      })
      .on('end', async () => {
        try {
          if (questionsToInsert.length === 0) {
            fs.unlinkSync(filePath);
            return res.status(400).json({
              success: false,
              message: 'No valid questions found. Ensure the CSV contains headers: question_text, option_a, option_b, option_c, option_d, correct_option, explanation'
            });
          }
          
          // 3. Batch insert questions sequentially
          let insertedCount = 0;
          for (const q of questionsToInsert) {
            await db.query(
              'INSERT INTO questions (quiz_id, question_text, option_a, option_b, option_c, option_d, correct_option, explanation) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
              [q.quizId, q.questionText, q.optionA, q.optionB, q.optionC, q.optionD, q.correctOption, q.explanation]
            );
            insertedCount++;
          }
          
          // Cleanup file
          fs.unlinkSync(filePath);
          
          return res.json({
            success: true,
            message: `Successfully uploaded ${insertedCount} questions to the quiz!`,
            insertedCount
          });
        } catch (dbErr) {
          console.error('Database error during bulk upload:', dbErr.message);
          if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
          return res.status(500).json({ success: false, message: 'Database error while saving bulk questions' });
        }
      });
  } catch (err) {
    console.error('File parsing error during bulk upload:', err.message);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    return res.status(500).json({ success: false, message: 'Server error during CSV processing' });
  }
}

module.exports = {
  bulkUploadQuestions
};
