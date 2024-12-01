# FinTrack - Financial Management Application

## Project Overview

FinTrack is a comprehensive personal finance management application that helps users track their income, expenses, and overall financial health. By utilizing external APIs, the application provides valuable insights and actionable recommendations to assist users in making informed financial decisions.

The application is divided into two main parts:

1. **Local Implementation**: In the first part, the application is developed to run locally on the user's machine. This can be either a Command-Line Interface (CLI) application or a web application with a frontend built using HTML, CSS, and JavaScript.

2. **Deployment**: The second part focuses on deploying the application to make it accessible online. The application is deployed on two standard web servers, and a load balancer is configured to distribute incoming traffic between them, ensuring reliable and scalable performance.

## Key Features

- **Financial Data Tracking**: Users can easily log their income and expenses, categorizing them for better organization and analysis.
- **Visualization and Reporting**: The application presents the financial data in a clear and visually appealing manner, allowing users to gain insights into their spending patterns and savings.
- **AI-Powered Financial Advice**: An AI-based financial advisor provides personalized recommendations based on the user's financial data, suggesting ways to optimize their budget and achieve their financial goals.
- **Secure API Integration**: The application securely integrates with external APIs to fetch relevant financial data, ensuring user privacy and data protection.
- **Responsive and Intuitive UI**: The user interface is designed to be user-friendly and responsive, providing a seamless experience across various devices.

## Technologies Used

- **Programming Language**: JavaScript
- **External APIs**: Gemini API, and Vintage Api


## Getting Started

### Prerequisites

- Node.js (version 12 or later)
- API keys for the external APIs used in the application

### Installation and Setup

1. Clone the repository:
   ```
   git clone https://github.com/your-username/fintrack.git
   ```
2. Install the necessary dependencies:
   ```
   cd fintrack
   npm install
   ```
3. Obtain the required API keys and securely store them in your environment.
4. Run the application locally:
   ```
   npm start
   ```
   The application will be available at `http://localhost:3000`.

## Deployment

1. Build a Docker image for the application:
   ```
   docker build -t fintrack .
   ```
2. Deploy the application on the two web servers (Web01 and Web02) .
3. Configure the load balancer (Lb01) to distribute incoming traffic between the two web servers.
4. Verify that the application is accessible and functioning correctly through the load balancer's address.


## Demo Video

https://www.loom.com/share/ab95550a4a3547a4bc98d71437d1421d?sid=f8ee17ff-051d-4d76-9735-bcad12b1462b

## Challenges and Lessons Learned

During the development and deployment of the FinTrack application, we encountered several challenges, including:

1. Integrating multiple external APIs and handling various data formats.
2. Ensuring the security and privacy of user data, particularly in managing API keys and other sensitive information.
3. Optimizing the application's performance and scalability, especially when handling increased traffic through the load balancer.

Through these challenges, we learned the importance of thorough planning, research, and testing to create a robust and reliable financial management application. We also gained valuable experience in deploying and managing applications in a distributed web server environment.

## API Credits

This application utilizes the following external APIs:

- **Gemini API**: [[Gemini API URL](https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent)]
- **vintage api**: [Vintage]https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=IBM&interval=5min&apikey=demo


