import { Component } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http'

@Component({
  selector: 'app-analysis',
  templateUrl: './analysis.component.html',
  styleUrls: ['./analysis.component.css']
})

export class AnalysisComponent {
  sentence = '';
  sentiment = '';
  score = 0;
  sentimentResults: any[] = []; // Declare the sentimentResults property as an array

  constructor(private http: HttpClient) {}

  analyzeSentiment() {
    // Define the API URL for sentiment analysis
    const apiUrl = 'http://localhost:8000/analyze-sentiment';

    // Create an object with the sentence
    const data = { sentence: this.sentence };

    // Define headers for the POST request 
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });

    // Perform a POST request to the FastAPI server
    this.http.post<any>(apiUrl, data, { headers }).subscribe(
      (response) => {
        // Handle the response here
        this.sentiment = response.sentiment;
        this.score = response.score;
      },
      (error) => {
        // Handle errors here
        console.error('Error:', error);
      }
    );
  }

  // Method to analyze sentiment for a PDF file
  analyzeSentimentForPDF(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const fileContent = e.target.result;
        this.analyzeSentimentForFile(fileContent);
      };
      reader.readAsArrayBuffer(file);
    }
    }
    

    // Method to analyze sentiment for the content of a PDF file
    analyzeSentimentForFile(fileContent: ArrayBuffer) {
      // Convert the ArrayBuffer to a Blob
      const blob = new Blob([new Uint8Array(fileContent)], { type: 'application/pdf' });
  
      // Create a FormData object and append the file
      const formData = new FormData();
      formData.append('file', blob);
  
      // Define headers for the POST request
      const headers = new HttpHeaders();
  
      // Perform a POST request to the FastAPI server
      const apiUrl = 'http://localhost:8000/analyze-sentiment-for-pdf';
      this.http.post<any>(apiUrl, formData, { headers }).subscribe(
        (response) => {
          // Handle the response here
          this.sentimentResults = response;
        },
        (error) => {
          // Handle errors here
          console.error('Error:', error);
        }
      );
    } 
  }


