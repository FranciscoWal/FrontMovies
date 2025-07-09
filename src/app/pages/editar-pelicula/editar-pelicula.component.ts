import { Component, OnInit, NgZone } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormGroup, FormBuilder, Validators, ValidatorFn, AbstractControl } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { PeliculasService } from '../../services/peliculas.service';
import { CommonModule } from '@angular/common';
import { Pelicula } from '../../models/pelicula.models';

@Component({
  selector: 'app-editar-pelicula',
  standalone: true, // Asumiendo que es un componente standalone
  imports: [FormsModule, ReactiveFormsModule],
  templateUrl: './editar-pelicula.component.html',
  styleUrl: './editar-pelicula.component.css'
})
export class EditarPeliculaComponent implements OnInit {
  peliculaForm: FormGroup = new FormGroup({});
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
  peliculaData: any = [];

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private ngZone: NgZone,
    private peliculaService: PeliculasService,
    private actRoute: ActivatedRoute

  ) {
    this.mainForm();
  }
  ngOnInit(): void {
    this.mainForm();
    let id = this.actRoute.snapshot.paramMap.get('id');
    this.getPelicula(id)

  }
  mainForm() {
    this.peliculaForm = this.formBuilder.group({
      nombre: ['', [Validators.required]],
      descripcion: ['', [Validators.required]],
      trailerLink: ['', [Validators.required, this.youtubeUrlValidator()]],
      poster: ['', [Validators.required, this.base64ImageValidator()]],
      genero: [[], [Validators.required, this.minGenresValidator(1)]] // Corregido: inicializado como arreglo
    });
  }

  youtubeUrlValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const value = control.value;
      if (!value) return null; // Validators.required se encarga del caso vacío
      const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)[A-Za-z0-9_-]{11}(&.*)?$/;
      return youtubeRegex.test(value) ? null : { invalidYoutubeUrl: true };
    };
  }
  base64ImageValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const value = control.value;
      if (!value) return null; // Validators.required se encarga del caso vacío
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
      // Agregar género si está marcado
      this.peliculaForm.get('genero')?.setValue([...currentGenres, genero]);
    } else {
      // Remover género si se desmarca
      this.peliculaForm.get('genero')?.setValue(currentGenres.filter((g: string) => g !== genero));
    }
    this.peliculaForm.get('genero')?.markAsTouched();
  }

  //Método para buscar la pelicula y verlo en el formulario
  getPelicula(id: any) {
    this.peliculaService.optenerPeliculasPorID(id).subscribe({
      next: (data: Pelicula) => {
        this.peliculaData = data;
        this.peliculaForm.setValue({
          nombre: data.nombre,
          descripcion: data.descripcion,
          trailerLink: data.trailerLink,
          poster: data.poster,
          genero: data.genero || [] // Asegura que genero sea un arreglo
        });
      },
      error: (e) => {
        console.error('Error al obtener la película:', e);
        alert('No se pudo cargar la película. Redirigiendo a la lista.');
        this.ngZone.run(() => this.router.navigateByUrl('/listar-pelicula'));
      }
    });
  }

  onSubmit() {
    this.enviado = true;
    if (!this.peliculaForm.valid) {
      return false;
    } else {
      if (window.confirm('¿Estás seguro que lo deseas modificar?')) {
        let id: any = this.actRoute.snapshot.paramMap.get('id')
        this.peliculaService.actualizarPelicula(id, this.peliculaForm.value)
          .subscribe({
            complete: () => {
              this.router.navigateByUrl('/listar-peliculas');
              console.log('Se actualizo correctamente');
            },
            error: (e) => {
              console.log(e);
            }
          })
      }
      return;
      

    }

  }

}
