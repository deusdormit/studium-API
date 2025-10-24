CREATE TABLE user_accounts (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    firstName VARCHAR(255) NOT NULL,
    lastName VARCHAR(255) NOT NULL,
    username VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE subjects (
    subject_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL, -- Added user_id column
    subject_name VARCHAR(255) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES user_accounts(user_id) -- Adjusted foreign key constraint
);

CREATE TABLE custom_session_lengths (
    session_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL, -- Added user_id column
    session_length_minutes INT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES user_accounts(user_id) -- Adjusted foreign key constraint
);

CREATE TABLE sessions (
    session_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    subject_id INT,
    session_start DATETIME NOT NULL,
    session_end DATETIME NOT NULL,
    FOREIGN KEY (user_id) REFERENCES user_accounts(user_id),
    FOREIGN KEY (subject_id) REFERENCES subjects(subject_id)
);
