import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class OcrService {

  // OPÇÃO 1: Usando Google Cloud Vision (recomendado para alta precisão)
  private googleVisionApiKey = 'SUA_CHAVE_AQUI';
  private googleVisionUrl = `https://vision.googleapis.com/v1/images:annotate?key=${this.googleVisionApiKey}`;

  constructor(private http: HttpClient) {}

  async extractText(base64Image: string): Promise<any> {
    // Remove o cabeçalho do data URL se existir
    const base64Content = base64Image.includes('base64,') 
      ? base64Image.split('base64,')[1] 
      : base64Image;

    // OPÇÃO 1: Google Cloud Vision (mais preciso)
    const requestBody = {
      requests: [{
        image: { content: base64Content },
        features: [{ type: 'TEXT_DETECTION', maxResults: 1 }]
      }]
    };

    try {
      const response = await lastValueFrom(
        this.http.post(this.googleVisionUrl, requestBody)
      );
      return response['responses'][0].textAnnotations || [];
    } catch (error) {
      console.error('Erro na API Vision:', error);
      throw error;
    }

    // OPÇÃO 2: Tesseract.js (gratuito, processamento local)
    // import { createWorker } from 'tesseract.js';
    // const worker = await createWorker('por');
    // const { data: { text } } = await worker.recognize(base64Image);
    // await worker.terminate();
    // return { text };
  }
}