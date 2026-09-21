-- Create Database
CREATE DATABASE PersonalizedNews;
GO

USE PersonalizedNews;
GO

-- 1. Users Table
CREATE TABLE Users (
    id INT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(100) NOT NULL,
    email NVARCHAR(150) UNIQUE NOT NULL,
    password NVARCHAR(255) NOT NULL,
    created_at DATETIME2 DEFAULT GETDATE()
);
GO
CREATE INDEX IX_Users_Email ON Users(email);
GO

-- 2. User Preferences Table
CREATE TABLE UserPreferences (
    id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT NOT NULL FOREIGN KEY REFERENCES Users(id) ON DELETE CASCADE,
    category NVARCHAR(50) NOT NULL
);
GO
CREATE INDEX IX_UserPreferences_UserId ON UserPreferences(user_id);
GO

-- 3. Articles Table
CREATE TABLE Articles (
    id INT IDENTITY(1,1) PRIMARY KEY,
    title NVARCHAR(MAX) NOT NULL,
    description NVARCHAR(MAX),
    content NVARCHAR(MAX),
    url NVARCHAR(MAX) NOT NULL,
    image_url NVARCHAR(MAX),
    source NVARCHAR(100),
    author NVARCHAR(150),
    category NVARCHAR(50),
    published_at DATETIME2,
    created_at DATETIME2 DEFAULT GETDATE()
);
GO
CREATE INDEX IX_Articles_Category ON Articles(category);
CREATE INDEX IX_Articles_PublishedAt ON Articles(published_at);
GO

-- 4. Article Summaries Table
CREATE TABLE ArticleSummaries (
    id INT IDENTITY(1,1) PRIMARY KEY,
    article_id INT NOT NULL FOREIGN KEY REFERENCES Articles(id) ON DELETE CASCADE,
    summary NVARCHAR(MAX) NOT NULL,
    created_at DATETIME2 DEFAULT GETDATE()
);
GO
CREATE INDEX IX_ArticleSummaries_ArticleId ON ArticleSummaries(article_id);
GO

-- 5. Bookmarks Table
CREATE TABLE Bookmarks (
    id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT NOT NULL FOREIGN KEY REFERENCES Users(id) ON DELETE CASCADE,
    article_id INT NOT NULL FOREIGN KEY REFERENCES Articles(id) ON DELETE CASCADE,
    created_at DATETIME2 DEFAULT GETDATE(),
    CONSTRAINT UQ_Bookmarks_User_Article UNIQUE (user_id, article_id)
);
GO
CREATE INDEX IX_Bookmarks_UserId ON Bookmarks(user_id);
GO

-- 6. Reading History Table
CREATE TABLE ReadingHistory (
    id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT NOT NULL FOREIGN KEY REFERENCES Users(id) ON DELETE CASCADE,
    article_id INT NOT NULL FOREIGN KEY REFERENCES Articles(id) ON DELETE CASCADE,
    read_at DATETIME2 DEFAULT GETDATE()
);
GO
CREATE INDEX IX_ReadingHistory_UserId ON ReadingHistory(user_id);
GO

-- 7. Article Likes Table
CREATE TABLE ArticleLikes (
    id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT NOT NULL FOREIGN KEY REFERENCES Users(id) ON DELETE CASCADE,
    article_id INT NOT NULL FOREIGN KEY REFERENCES Articles(id) ON DELETE CASCADE,
    created_at DATETIME2 DEFAULT GETDATE(),
    CONSTRAINT UQ_ArticleLikes_User_Article UNIQUE (user_id, article_id)
);
GO
CREATE INDEX IX_ArticleLikes_UserId ON ArticleLikes(user_id);
GO

-- 8. Daily Digest Table
CREATE TABLE DailyDigests (
    id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT NOT NULL FOREIGN KEY REFERENCES Users(id) ON DELETE CASCADE,
    digest_date DATE NOT NULL,
    title NVARCHAR(255),
    created_at DATETIME2 DEFAULT GETDATE()
);
GO
CREATE INDEX IX_DailyDigests_UserId ON DailyDigests(user_id);
GO

