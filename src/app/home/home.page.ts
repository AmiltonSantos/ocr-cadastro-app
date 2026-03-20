import { Component, ViewChild } from '@angular/core';
import {
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButtons,
    IonButton,
    IonIcon,
    IonProgressBar,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    ToastController
} from '@ionic/angular/standalone';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { ImageCropperComponent, ImageCroppedEvent } from 'ngx-image-cropper'; // ✅ Apenas ImageCropperComponent
import { CommonModule } from '@angular/common';
import { addIcons } from 'ionicons';
import { camera, scan, refresh, alertCircle } from 'ionicons/icons';
import { Capacitor } from '@capacitor/core';
import { OcrService } from '../services/ocr.service';

@Component({
    selector: 'app-home',
    templateUrl: 'home.page.html',
    styleUrls: ['home.page.scss'],
    standalone: true,
    imports: [
        CommonModule,
        IonHeader,
        IonToolbar,
        IonTitle,
        IonContent,
        IonButtons,
        IonButton,
        IonIcon,
        IonProgressBar,
        IonCard,
        IonCardHeader,
        IonCardTitle,
        IonCardContent,
        ImageCropperComponent
    ]
})
export class HomePage {
    @ViewChild(ImageCropperComponent) imageCropper!: ImageCropperComponent;

    croppedImageBase64: string = '';
    showCropper = false;
    isLoading = false;
    hasValidImage = false;

    imageFile: File | undefined = undefined;

    constructor(private toastController: ToastController,
        private ocrService: OcrService
    ) {
        addIcons({ camera, scan, refresh, alertCircle });
    }

    async takePicture(): Promise<void> {
        try {
            this.isLoading = true;
            this.showCropper = false;

            // Detecta se está rodando como app nativo ou browser
            const isNative = Capacitor.isNativePlatform();

            if (isNative) {
                // App nativo → usa Capacitor Camera
                await this.takePictureNative();
            } else {
                // Browser → usa API nativa do browser
                await this.takePictureBrowser();
            }

        } catch (error) {
            console.error('Erro ao capturar imagem:', error);
            this.showToast('Erro ao capturar imagem', 'danger');
        } finally {
            this.isLoading = false;
        }
    }

    private async takePictureNative(): Promise<void> {
        const image = await Camera.getPhoto({
            quality: 90,
            allowEditing: false,
            resultType: CameraResultType.DataUrl,
            source: CameraSource.Camera
        });

        if (!image.dataUrl) throw new Error('Imagem não capturada');
        this.loadImageFromDataUrl(image.dataUrl);
    }

    private async takePictureBrowser(): Promise<void> {
        return new Promise((resolve, reject) => {
            // Cria input file oculto com capture para forçar câmera no mobile browser
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*';
            input.capture = 'environment'; // câmera traseira

            input.onchange = async (event: any) => {
                const file: File = event.target.files[0];
                if (!file) { reject('Nenhum arquivo selecionado'); return; }

                const reader = new FileReader();
                reader.onload = (e: any) => {
                    this.loadImageFromDataUrl(e.target.result);
                    resolve();
                };
                reader.onerror = () => reject('Erro ao ler arquivo');
                reader.readAsDataURL(file);
            };

            input.oncancel = () => resolve(); // usuário cancelou, sem erro
            input.click();
        });
    }

    private loadImageFromDataUrl(dataUrl: string): void {
        const blob = this.base64ToBlob(dataUrl);
        this.imageFile = new File([blob], 'foto.jpg', { type: 'image/jpeg' });
        this.showCropper = true;
    }

    private base64ToBlob(base64: string): Blob {
        const byteString = atob(base64.split(',')[1]);
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);

        for (let i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
        }

        return new Blob([ab], { type: 'image/jpeg' });
    }

    imageCropped(event: ImageCroppedEvent) {
        console.log('Imagem recortada:', event);
        if (event.blob) {
            const reader = new FileReader();
            reader.onload = (e: any) => {
                this.croppedImageBase64 = e.target.result;
                this.hasValidImage = true;
                console.log('Base64 salvo com sucesso');
            };
            reader.readAsDataURL(event.blob);
        }
    }

    imageLoaded() {
        console.log('Imagem carregada com sucesso!');
        this.showToast('Imagem carregada', 'success');
    }

    cropperReady() {
        console.log('Cropper pronto!');
    }

    loadImageFailed() {
        console.error('Falha ao carregar imagem');
        this.showToast('Falha ao carregar imagem', 'danger');
    }

    async processImage() {

        this.isLoading = true;

        try {
            const jsonText = await this.ocrService.extractText(this.croppedImageBase64);
            const dados = JSON.parse(jsonText);

            console.log('Dados extraídos:', dados);
            this.showToast('Dados extraídos com sucesso!', 'success');

            // Aqui você navega para a próxima tela passando os dados
            // this.router.navigate(['/cadastro'], { state: { dados } });

        } catch (error) {
            console.error('Erro ao processar:', error);
            this.showToast('Erro ao extrair dados da imagem', 'danger');
        } finally {
            this.isLoading = false;
        }
    }
    private async showToast(message: string, color: string = 'primary') {
        const toast = await this.toastController.create({
            message,
            duration: 2000,
            color,
            position: 'bottom'
        });
        await toast.present();
    }

    resetCropper() {
        this.showCropper = false;
        this.imageFile = undefined;
        this.croppedImageBase64 = '';
        this.hasValidImage = false;
    }
}