import { Routes } from '@angular/router';
import { AgregarPeliculaComponent } from './pages/agregar-pelicula/agregar-pelicula.component';
import { EditarPeliculaComponent } from './pages/editar-pelicula/editar-pelicula.component';
import { ListarPeliculaComponent } from './pages/listar-pelicula/listar-pelicula.component';

export const routes: Routes = [
    {
        path: '',
        pathMatch: 'full',
        redirectTo: 'agregar-peliculas'
    },
    {
        path:'agregar-peliculas',
        component: AgregarPeliculaComponent
    },
    {
        path:'editar-pelicula/:id',
        component: EditarPeliculaComponent
    },
    {
        path:'listar-peliculas',
        component: ListarPeliculaComponent
    },
    {
        path:'**',
        redirectTo:'listar-peliculas'
    }



];
