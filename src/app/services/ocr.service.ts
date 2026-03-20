import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AiModelsService } from './ai.models.service';

@Injectable({ providedIn: 'root' })
export class OcrService {

    private prompt = `
        Extraia todos os dados desta ficha cadastral e retorne APENAS um JSON válido, sem explicações, sem markdown, sem blocos de código.

        O JSON deve seguir exatamente este formato:
        {
            "nome": "",                             
            "cpf": "",       
            "data_nascimento": "",
            "sexo": "",
            "estado civil": "",                                
            "rg": "",
            "telefone": "",
            "email": "",
            "endereco": "",
            "bairro": "",
            "cidade": "",
            "estado": "",
            "cep": "",
            "outros": {}
        }

        Preencha apenas os campos que conseguir identificar na imagem. Campos não encontrados deixe como string vazia.
        Para campos extras que não estão na lista, coloque dentro de "outros".
    `;


    constructor(private http: HttpClient, private aiModels: AiModelsService) { }

    async extractText(base64Image: string): Promise<any> {
        const raw = await this.aiModels.generate(this.prompt, base64Image);
        return JSON.parse(raw);
    }
}