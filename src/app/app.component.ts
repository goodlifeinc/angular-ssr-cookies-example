import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  constructor(private readonly http: HttpClient) {}
  ngOnInit(): void {
    this.http.get('http://localhost:4000/test', { observe: 'response' }).subscribe(res => {
      console.log(res.headers);
    });

  }
  title = 'app';
}
