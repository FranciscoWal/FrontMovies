import { Component, OnInit, NgZone } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormGroup, FormBuilder, Validators, ValidatorFn, AbstractControl } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { PeliculasService } from '../../services/peliculas.service';
import { CommonModule } from '@angular/common';
import { Pelicula } from '../../models/pelicula.models';

@Component({
  selector: 'app-agregar-pelicula',
  standalone: true, // Asumiendo que es un componente standalone
  imports: [FormsModule, ReactiveFormsModule, RouterModule, CommonModule],
  templateUrl: './agregar-pelicula.component.html',
  styleUrl: './agregar-pelicula.component.css'
})
export class AgregarPeliculaComponent implements OnInit {
  peliculaForm: FormGroup = new FormGroup({});
  generosDisponibles: string[] = [
    'Acción',
    'Aventura',
    'Comedia',
    'Drama',
    'Terror',
    'Ciencia Ficción',
    'Fantasía',
    'Romance',
    'Documental',
    'Animación'
  ];
  enviado: boolean = false;


  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private ngZone: NgZone,
    private peliculaService: PeliculasService
  ) {
    this.mainForm();
  }

  ngOnInit(): void {}

  mainForm() {
    this.peliculaForm = this.formBuilder.group({
      nombre: ['', [Validators.required]],
      descripcion: ['', [Validators.required]],
      trailerLink: ['', [Validators.required, this.youtubeUrlValidator()]],
      poster: ['', [Validators.required, this.base64ImageValidator()]],
      genero: [[], [Validators.required, this.minGenresValidator(1)]] // Corregido: inicializado como arreglo
    });
  }

  // Método para manejar la carga de imágenes
  onFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        this.peliculaForm.get('poster')?.setValue(reader.result as string);
        this.peliculaForm.get('poster')?.markAsTouched();
      };
      reader.readAsDataURL(file); // Convierte la imagen a base64
    }
  }

  // Método para manejar la selección de géneros
  onGenreChange(event: Event, genero: string) {
    const input = event.target as HTMLInputElement;
    const currentGenres = this.peliculaForm.get('genero')?.value || [];
    if (input.checked) {
      // Agregar género si está marcado
      this.peliculaForm.get('genero')?.setValue([...currentGenres, genero]);
    } else {
      // Remover género si se desmarca
      this.peliculaForm.get('genero')?.setValue(currentGenres.filter((g: string) => g !== genero));
    }
    this.peliculaForm.get('genero')?.markAsTouched();
  }

  // Validador para enlaces de YouTube
  youtubeUrlValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const value = control.value;
      if (!value) return null; // Validators.required se encarga del caso vacío
      const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)[A-Za-z0-9_-]{11}(&.*)?$/;
      return youtubeRegex.test(value) ? null : { invalidYoutubeUrl: true };
    };
  }

  // Validador para imágenes en base64
  base64ImageValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const value = control.value;
      if (!value) return null; // Validators.required se encarga del caso vacío
      const base64ImageRegex = /^data:image\/(png|jpeg|jpg|gif);base64,[A-Za-z0-9+/=]+$/;
      return base64ImageRegex.test(value) ? null : { invalidBase64Image: true };
    };
  }

  // Validador para asegurar que al menos X géneros estén seleccionados
  minGenresValidator(min: number): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const value = control.value;
      if (!value || !Array.isArray(value)) return { invalidGenres: true };
      return value.length >= min ? null : { minGenres: { required: min, actual: value.length } };
    };
  }

  // Getter para acceder a los controles del formulario
  get myForm() {
    return this.peliculaForm.controls;
  }

  // Método para enviar el formulario
  onSubmit() {
    this.enviado = true;
    if (!this.peliculaForm.valid) {
      this.peliculaForm.markAllAsTouched(); // Marca todos los campos como tocados para mostrar errores
      return;
    }

    this.peliculaService.agregarPelicula(this.peliculaForm.value).subscribe({
      next: () => {
        console.log('Película agregada correctamente');
        this.ngZone.run(() => this.router.navigateByUrl('/listar-peliculas')); // Corregido: ruta consistente
      },
      error: (e) => {
        console.error('Error al agregar la película:', e);
        alert('Error al agregar la película. Por favor, intenta de nuevo.');
      }
    });
  }
}