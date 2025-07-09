import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PeliculasService } from '../../services/peliculas.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-listar-pelicula',
  imports: [RouterLink],
  templateUrl: './listar-pelicula.component.html',
  styleUrl: './listar-pelicula.component.css'
})
export class ListarPeliculaComponent implements OnInit {


  peliculas: any = [RouterLink];
  constructor(private peliculaService: PeliculasService,
    private sanitizer: DomSanitizer
  ){
    this.getPeliculas();

  } 
  ngOnInit(): void {
      
  } 
  getPeliculas() {
    this.peliculaService.optenerPeliculas().subscribe((data)=>{
     this.peliculas = data; 
     console.log('Películas obtenidas:', this.peliculas); // Agregado console.log
    })
  }

  sanitizeUrl(url: string): SafeResourceUrl {
    // Asegúrate de que el enlace sea en formato embed (por ejemplo, https://www.youtube.com/embed/VIDEO_ID)
    const embedUrl = url.replace('watch?v=', 'embed/');
    return this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl);
  }


  eliminarPelicula (pelicula: any, index: any){
    if (window.confirm('¿Estas seguro de eliminar?')){
      this.peliculaService.eliminarPelicula(pelicula._id)
      .subscribe((data)=>{
        this.peliculas.spliece(index,1);
      })
    }
  }
  
}
