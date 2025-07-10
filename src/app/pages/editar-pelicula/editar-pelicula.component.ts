import { Component, OnInit, NgZone } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormGroup, FormBuilder, Validators, ValidatorFn, AbstractControl } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { PeliculasService } from '../../services/peliculas.service';
import { CommonModule } from '@angular/common';
import { Pelicula } from '../../models/pelicula.models';

@Component({
  selector: 'app-editar-pelicula',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, RouterModule, CommonModule],
  templateUrl: './editar-pelicula.component.html',
  styleUrl: './editar-pelicula.component.css'
})
export class EditarPeliculaComponent implements OnInit {
  peliculaForm: FormGroup;
  enviado: boolean = false;
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
  peliculaData: Pelicula | null = null; // Corregido: Single Pelicula or null

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private ngZone: NgZone,
    private peliculaService: PeliculasService,
    private actRoute: ActivatedRoute
  ) {
    this.peliculaForm = this.formBuilder.group({
      nombre: ['', [Validators.required]],
      descripcion: ['', [Validators.required]],
      trailerLink: ['', [Validators.required, this.youtubeUrlValidator()]],
      poster: ['', [Validators.required, this.base64ImageValidator()]],
      genero: [[], [Validators.required, this.minGenresValidator(1)]]
    });
  }

  ngOnInit(): void {
    const id = this.actRoute.snapshot.paramMap.get('id');
    if (id) {
      this.getPelicula(id);
    } else {
      console.error('ID de película no proporcionado');
      this.ngZone.run(() => this.router.navigateByUrl('/listar-pelicula'));
    }
  }

  youtubeUrlValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const value = control.value;
      if (!value) return null; // Validators.required handles empty case
      const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)[A-Za-z0-9_-]{11}(&.*)?$/;
      return youtubeRegex.test(value) ? null : { invalidYoutubeUrl: true };
    };
  }

  base64ImageValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const value = control.value;
      if (!value) return null; // Validators.required handles empty case
      const base64ImageRegex = /^data:image\/(png|jpeg|jpg|gif);base64,[A-Za-z0-9+/=]+$/;
      return base64ImageRegex.test(value) ? null : { invalidBase64Image: true };
    };
  }

  minGenresValidator(min: number): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const value = control.value;
      if (!value || !Array.isArray(value)) return { invalidGenres: true };
      return value.length >= min ? null : { minGenres: { required: min, actual: value.length } };
    };
  }

  get myForm() {
    return this.peliculaForm.controls;
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
      this.peliculaForm.get('genero')?.setValue([...currentGenres, genero]);
    } else {
      this.peliculaForm.get('genero')?.setValue(currentGenres.filter((g: string) => g !== genero));
    }
    this.peliculaForm.get('genero')?.markAsTouched();
  }

  // Método para buscar la película y cargar sus datos en el formulario
  getPelicula(id: string) {
    this.peliculaService.optenerPeliculasPorID(id).subscribe({
      next: (data: Pelicula) => {
        this.peliculaData = data;
        this.peliculaForm.setValue({
          nombre: data.nombre,
          descripcion: data.descripcion,
          trailerLink: data.trailerLink,
          poster: data.poster,
          genero: data.genero || []
        });
      },
      error: (e) => {
        console.error('Error al obtener la película:', e);
        alert('No se pudo cargar la película. Redirigiendo a la lista.');
        this.ngZone.run(() => this.router.navigateByUrl('/listar-pelicula'));
      }
    });
  }

  // Método para enviar el formulario
  onSubmit() {
    this.enviado = true;
    if (!this.peliculaForm.valid) {
      this.peliculaForm.markAllAsTouched();
      return;
    }

    if (!window.confirm('¿Estás seguro de que deseas modificar?')) {
      return;
    }

    const id = this.actRoute.snapshot.paramMap.get('id');
    if (!id) {
      console.error('ID de película no proporcionado');
      alert('Error: No se proporcionó un ID válido.');
      return;
    }

    this.peliculaService.actualizarPelicula(id, this.peliculaForm.value).subscribe({
      next: () => {
        console.log('Película actualizada correctamente');
        this.ngZone.run(() => this.router.navigateByUrl('/listar-peliculas'));
      },
      error: (e) => {
        console.error('Error al actualizar la película:', e);
        alert('Error al actualizar la película. Por favor, intenta de nuevo.');
      }
    });
  }
}