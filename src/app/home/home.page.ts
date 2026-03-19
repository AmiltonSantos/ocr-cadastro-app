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

    constructor(private toastController: ToastController) {
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

    // async takePicture(): Promise<void> {
    //     try {
    //         this.isLoading = true;
    //         const image = await Camera.getPhoto({
    //             quality: 90,
    //             allowEditing: false,
    //             resultType: CameraResultType.DataUrl,
    //             source: CameraSource.Camera
    //         });

    //         if (!image.dataUrl) throw new Error('Imagem não capturada');

    //         // Converte direto para File e passa via [imageFile]
    //         const blob = this.base64ToBlob(image.dataUrl);
    //         this.imageFile = new File([blob], 'ficha-cadastral.jpg', { type: 'image/jpeg' });

    //         // Aguarda um ciclo para garantir que o DOM atualizou
    //         await new Promise(resolve => setTimeout(resolve, 50));

    //         // Depois mostra o cropper
    //         this.showCropper = true;

    //     } catch (error) {
    //         console.error('Erro ao capturar imagem:', error);
    //         this.showToast('Erro ao capturar imagem', 'danger');
    //     } finally {
    //         this.isLoading = false;
    //     }
    // }

    private base64ToBlob(base64: string): Blob {
        const byteString = atob(base64.split(',')[1]);
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);

        for (let i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
        }

        return new Blob([ab], { type: 'image/jpeg' });
    }

    // private async dataUrlToFile(dataUrl: string, filename: string): Promise<File> {
    //     const response = await fetch(dataUrl);
    //     const blob = await response.blob();
    //     return new File([blob], filename, { type: blob.type });
    // }

    imageCropped(event: ImageCroppedEvent) {
        console.log('Imagem recortada:', event);
        if (event.base64) {
            this.croppedImageBase64 = event.base64;
            this.hasValidImage = true;
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
        if (!this.hasValidImage) {
            this.showToast('Recorte uma imagem primeiro', 'warning');
            return;
        }

        this.isLoading = true;

        try {
            // Simula processamento OCR
            await new Promise(resolve => setTimeout(resolve, 2000));
            this.showToast('Imagem processada com sucesso!', 'success');
        } catch (error) {
            console.error('Erro no processamento:', error);
            this.showToast('Erro ao processar imagem', 'danger');
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
        this.imageFile = undefined;  // ← era null
        this.croppedImageBase64 = '';
        this.hasValidImage = false;
    }
}