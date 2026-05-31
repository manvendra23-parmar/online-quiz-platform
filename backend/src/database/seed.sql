-- Seed data for Online Quiz & Assessment Platform
-- Note: Password hashes are pre-computed using bcrypt (rounds = 10)
-- 'adminpassword' -> '$2a$10$P24/8uH.5uGv8e6LqP09c.YlB7B22bKjH8N3h2O6W5g1t/4y8c5lC'
-- 'userpassword'  -> '$2a$10$vD2/YJv7W.uUqHhKqK09c.7N7T4K8k2O6W5g1t/4y8c5lCF3z9g7q'

-- Seed Users
INSERT INTO users (id, username, email, password_hash, role, avatar) VALUES
(1, 'QuizAdmin', 'admin@quizplatform.com', '$2a$10$P24/8uH.5uGv8e6LqP09c.YlB7B22bKjH8N3h2O6W5g1t/4y8c5lC', 'admin', 'avatar_admin'),
(2, 'AlexCoder', 'user@quizplatform.com', '$2a$10$vD2/YJv7W.uUqHhKqK09c.7N7T4K8k2O6W5g1t/4y8c5lCF3z9g7q', 'user', 'avatar_1'),
(3, 'JaneScience', 'jane@quizplatform.com', '$2a$10$vD2/YJv7W.uUqHhKqK09c.7N7T4K8k2O6W5g1t/4y8c5lCF3z9g7q', 'user', 'avatar_2'),
(4, 'JohnHistory', 'john@quizplatform.com', '$2a$10$vD2/YJv7W.uUqHhKqK09c.7N7T4K8k2O6W5g1t/4y8c5lCF3z9g7q', 'user', 'avatar_3');

-- Seed Quizzes
INSERT INTO quizzes (id, title, description, duration_minutes, passing_score, positive_points, negative_points, is_active, created_by) VALUES
(1, 'Web Development Essentials', 'Test your knowledge of foundational web technologies: HTML5, CSS3, JavaScript, and general web protocols. Recommended for aspiring developers.', 10, 60, 10.0, 2.5, 1, 1),
(2, 'Science & Cosmos Trivia', 'Embark on a journey through astronomy, biology, chemistry, and physics! Challenge yourself with questions about our universe and its laws.', 15, 60, 5.0, 1.0, 1, 1),
(3, 'World History Challenge', 'A quick test covering crucial moments in global history, from ancient civilizations to the modern era. No negative marking enabled!', 8, 40, 4.0, 0.0, 1, 1);

-- Seed Questions for Quiz 1 (Web Development Essentials)
INSERT INTO questions (id, quiz_id, question_text, option_a, option_b, option_c, option_d, correct_option, explanation) VALUES
(1, 1, 'Which of the following HTML5 elements is used to represent self-contained composition in a document, such as a forum post or blog article?', '<section>', '<article>', '<aside>', '<div>', 'B', 'The <article> element represents a self-contained composition in a document, page, application, or site, which is intended to be independently distributable or reusable.'),
(2, 1, 'What is the correct CSS syntax to select all elements with the class name "highlight" and set their background color to yellow?', '.highlight { background-color: yellow; }', '#highlight { background-color: yellow; }', 'highlight { background-color: yellow; }', '*.highlight { bg-color: yellow; }', 'A', 'In CSS, a class selector is prefixed with a dot (.) followed by the class name. The property to change background color is "background-color".'),
(3, 1, 'Which of the following is NOT a primitive data type in JavaScript?', 'String', 'Boolean', 'Undefined', 'Array', 'D', 'In JavaScript, primitive types include String, Number, BigInt, Boolean, Undefined, Null, and Symbol. Arrays are objects, which are reference types.'),
(4, 1, 'What does the HTTP status code 403 represent?', 'Bad Request', 'Unauthorized', 'Forbidden', 'Not Found', 'C', 'The HTTP 403 Forbidden client error status response code indicates that the server understands the request but refuses to authorize it.'),
(5, 1, 'In JavaScript, what is the behavior of the "let" keyword compared to "var"?', 'let has block scope, while var has function scope', 'let has function scope, while var has block scope', 'let can be redeclared, while var cannot', 'let is hoisted to the top and initialized as undefined', 'A', 'Variables declared with let have block scope (confined to the enclosing {} block), whereas var variables have function scope.');

-- Seed Questions for Quiz 2 (Science & Cosmos Trivia)
INSERT INTO questions (id, quiz_id, question_text, option_a, option_b, option_c, option_d, correct_option, explanation) VALUES
(6, 2, 'Approximately how long does it take for light from the Sun to reach the Earth?', '8 seconds', '8 minutes', '8 hours', '8 days', 'B', 'Light travels at about 300,000 km/s. The distance from the Sun to Earth is roughly 150 million km, which takes about 8 minutes and 20 seconds (500 seconds) to travel.'),
(7, 2, 'Which organelle is known as the powerhouse of the cell, responsible for producing ATP through cellular respiration?', 'Nucleus', 'Ribosome', 'Mitochondrion', 'Golgi apparatus', 'C', 'Mitochondria are double membrane-bound organelles that generate most of the chemical energy needed to power the cell''s biochemical reactions, stored as ATP.'),
(8, 2, 'What is the chemical symbol for the element Gold?', 'Ag', 'Fe', 'Au', 'Gd', 'C', 'The chemical symbol for Gold is Au, derived from the Latin word "aurum", which means "shining dawn". Ag is Silver, Fe is Iron.'),
(9, 2, 'Which of Newton''s Laws of Motion states that for every action, there is an equal and opposite reaction?', 'First Law', 'Second Law', 'Third Law', 'Law of Gravitation', 'C', 'Newton''s Third Law of Motion states that when one body exerts a force on a second body, the second body simultaneously exerts a force equal in magnitude and opposite in direction on the first body.'),
(10, 2, 'What is the most abundant gas in the Earth''s atmosphere by volume?', 'Oxygen', 'Carbon Dioxide', 'Nitrogen', 'Argon', 'C', 'Earth''s atmosphere is composed of approximately 78% Nitrogen, 21% Oxygen, 0.93% Argon, 0.04% Carbon Dioxide, and trace amounts of other gases.');

-- Seed Questions for Quiz 3 (World History Challenge)
INSERT INTO questions (id, quiz_id, question_text, option_a, option_b, option_c, option_d, correct_option, explanation) VALUES
(11, 3, 'In which year did the Western Roman Empire traditionally fall, marking the start of the European Middle Ages?', '476 AD', '1453 AD', '325 AD', '800 AD', 'A', 'The Western Roman Empire fell in 476 AD when the last Roman emperor, Romulus Augustulus, was deposed by the Germanic chieftain Odoacer.'),
(12, 3, 'Who was the first emperor of the Roman Empire, ruling from 27 BC until his death in 14 AD?', 'Julius Caesar', 'Augustus (Octavian)', 'Nero', 'Marcus Aurelius', 'B', 'Augustus, born Octavian, was the founder of the Roman Empire and its first Emperor, ruling during the Pax Romana.'),
(13, 3, 'The Magna Carta, a historical charter that limited the absolute power of the monarch, was signed by King John of England in which year?', '1066', '1215', '1492', '1688', 'B', 'The Magna Carta (Great Charter) was agreed to by King John at Runnymede, near Windsor, on 15 June 1215, to make peace between the unpopular King and a group of rebel barons.'),
(14, 3, 'Which ancient civilization constructed the city of Machu Picchu in the Andes Mountains of Peru?', 'The Aztecs', 'The Mayans', 'The Incas', 'The Olmecs', 'C', 'Machu Picchu is a 15th-century Inca citadel located in the Eastern Cordillera of southern Peru on a 2,430-meter mountain ridge.'),
(15, 3, 'The United Nations was officially established immediately following the end of which major global conflict?', 'World War I', 'World War II', 'The Napoleonic Wars', 'The Cold War', 'B', 'The United Nations (UN) was established on 24 October 1945, immediately following World War II, replacing the ineffective League of Nations to prevent future global wars.');

-- Seed Quiz Attempts
INSERT INTO quiz_attempts (id, user_id, quiz_id, start_time, end_time, is_submitted) VALUES
(1, 2, 1, '2026-05-30 10:00:00', '2026-05-30 10:08:30', 1), -- Alex attempted Quiz 1
(2, 3, 1, '2026-05-30 11:00:00', '2026-05-30 11:09:15', 1), -- Jane attempted Quiz 1
(3, 4, 1, '2026-05-30 12:00:00', '2026-05-30 12:07:45', 1), -- John attempted Quiz 1
(4, 2, 2, '2026-05-30 14:00:00', '2026-05-30 14:12:00', 1), -- Alex attempted Quiz 2
(5, 3, 2, '2026-05-30 15:00:00', '2026-05-30 15:10:00', 1); -- Jane attempted Quiz 2

-- Seed Answers for Attempt 1 (Alex on Quiz 1 - 4 correct, 1 wrong)
-- Q1: B (correct), Q2: A (correct), Q3: D (correct), Q4: C (correct), Q5: B (incorrect, correct is A)
INSERT INTO answers (attempt_id, question_id, selected_option, is_correct) VALUES
(1, 1, 'B', 1),
(1, 2, 'A', 1),
(1, 3, 'D', 1),
(1, 4, 'C', 1),
(1, 5, 'B', 0);

-- Seed Answers for Attempt 2 (Jane on Quiz 1 - 5 correct)
INSERT INTO answers (attempt_id, question_id, selected_option, is_correct) VALUES
(2, 1, 'B', 1),
(2, 2, 'A', 1),
(2, 3, 'D', 1),
(2, 4, 'C', 1),
(2, 5, 'A', 1);

-- Seed Answers for Attempt 3 (John on Quiz 1 - 3 correct, 2 wrong)
INSERT INTO answers (attempt_id, question_id, selected_option, is_correct) VALUES
(3, 1, 'B', 1),
(3, 2, 'B', 0),
(3, 3, 'D', 1),
(3, 4, 'A', 0),
(3, 5, 'A', 1);

-- Seed Answers for Attempt 4 (Alex on Quiz 2 - 3 correct, 2 wrong)
-- Q6: B (correct), Q7: C (correct), Q8: A (incorrect, correct is Au/C), Q9: C (correct), Q10: A (incorrect, correct is Nitrogen/C)
INSERT INTO answers (attempt_id, question_id, selected_option, is_correct) VALUES
(4, 6, 'B', 1),
(4, 7, 'C', 1),
(4, 8, 'A', 0),
(4, 9, 'C', 1),
(4, 10, 'A', 0);

-- Seed Answers for Attempt 5 (Jane on Quiz 2 - 4 correct, 1 wrong)
INSERT INTO answers (attempt_id, question_id, selected_option, is_correct) VALUES
(5, 6, 'B', 1),
(5, 7, 'C', 1),
(5, 8, 'C', 1),
(5, 9, 'C', 1),
(5, 10, 'A', 0);

-- Seed Results
-- Score calc for Quiz 1: +10 per correct, -2.5 per wrong. Max score = 50
-- Attempt 1 (Alex): 4 correct (+40), 1 wrong (-2.5) = 37.5. Score = 37.5 (75%). Passed!
-- Attempt 2 (Jane): 5 correct (+50), 0 wrong = 50.0. Score = 50.0 (100%). Passed!
-- Attempt 3 (John): 3 correct (+30), 2 wrong (-5.0) = 25.0. Score = 25.0 (50%). Failed! (passing is 60%)
-- Score calc for Quiz 2: +5 per correct, -1 per wrong. Max score = 25
-- Attempt 4 (Alex): 3 correct (+15), 2 wrong (-2.0) = 13.0. Score = 13.0 (52%). Failed!
-- Attempt 5 (Jane): 4 correct (+20), 1 wrong (-1.0) = 19.0. Score = 19.0 (76%). Passed!
INSERT INTO results (attempt_id, user_id, quiz_id, total_questions, correct_answers, incorrect_answers, score, passed) VALUES
(1, 2, 1, 5, 4, 1, 37.5, 1),
(2, 3, 1, 5, 5, 0, 50.0, 1),
(3, 4, 1, 5, 3, 2, 25.0, 0),
(4, 2, 2, 5, 3, 2, 13.0, 0),
(5, 3, 2, 5, 4, 1, 19.0, 1);

-- Seed Leaderboard
INSERT INTO leaderboard (user_id, quiz_id, highest_score, total_attempts) VALUES
(3, 1, 50.0, 1), -- Jane is #1 on Quiz 1
(2, 1, 37.5, 1), -- Alex is #2 on Quiz 1
(4, 1, 25.0, 1), -- John is #3 on Quiz 1
(3, 2, 19.0, 1), -- Jane is #1 on Quiz 2
(2, 2, 13.0, 1); -- Alex is #2 on Quiz 2
