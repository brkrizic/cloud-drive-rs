# Stashr
Stashr distributed file storage system built with a serverless AWS architecture. The system uses React frontend and REST APIs via API Gateway, with Lambda functions, S3 storage, DynamoDB metadata, and CloudFront for global content delivery. Demonstrates microservice-based distributed system design.


# Stashr – Distributed Cloud Storage System

## 📌 Overview

CloudDrive is a cloud-native distributed file storage system built using a serverless architecture. The system allows users to securely upload, store, and retrieve files through a web client. It demonstrates core principles of distributed systems including scalability, fault tolerance, and loosely coupled services.

## 🏗️ Architecture

The system is built on a serverless microservice architecture using AWS cloud services:

* React Native frontend (client layer)
* AWS API Gateway (REST communication layer)
* AWS Lambda (business logic / compute layer)
* Amazon S3 (distributed object storage)
* Amazon DynamoDB (metadata storage)
* AWS CloudFront (content delivery network)

## 🔄 System Workflow

1. User interacts with React frontend
2. Requests are sent via REST API Gateway
3. AWS Lambda processes business logic
4. Files are stored in Amazon S3
5. Metadata is stored in DynamoDB
6. Files are delivered globally via CloudFront

## 🌐 Distributed Systems Concepts

This system demonstrates:

* Microservice/serverless architecture
* Horizontal scalability
* Event-driven processing
* Distributed storage (S3)
* Data partitioning and metadata separation (DynamoDB)
* Global content distribution (CloudFront)
* Stateless compute (Lambda)

## ⚙️ Features

* User authentication (optional)
* File upload
* File listing
* File download
* Cloud-based storage and retrieval

## 🧱 Tech Stack

* React Native (Frontend)
* AWS Lambda (Backend compute)
* AWS API Gateway (REST API)
* Amazon S3 (File storage)
* Amazon DynamoDB (Database)
* AWS CloudFront (CDN)

## 🎯 Purpose

This project is developed as part of a Distributed Systems course to demonstrate practical implementation of a real-world cloud-native distributed architecture using modern serverless technologies.

## Development History

This project was originally developed and maintained in a private Gitea repository during development.

The GitHub repository is a migrated/public version prepared for project submission.

The original development history and timeline are preserved in Gitea.
