import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  //{ path: '', loadChildren: './tabs/tabs.module#TabsPageModule' },
  //{ path: '', loadChildren: './home/home.module#HomePageModule' },
  //{ path: '', loadChildren: './tab1/tab1.module#Tab1PageModule' },
  { path: '', loadChildren: './guides/guides.module#GuidesPageModule' },
  { path: 'add-track', loadChildren: './add-track/add-track.module#AddTrackPageModule' },
  { path: 'test', loadChildren: './test/test.module#TestPageModule' },
  { path: 'track', loadChildren: './tab1/tab1.module#Tab1PageModule' },
  { path: 'tracks', loadChildren: './tab2/tab2.module#Tab2PageModule' },
  { path: 'guide/:id/:mode', loadChildren: './guide/guide.module#GuidePageModule' },
  { path: 'guides/:mode', loadChildren: './guides/guides.module#GuidesPageModule' },
  { path: 'create-guide/:uuid/:mode', loadChildren: './create-guide/create-guide.module#CreateGuidePageModule' },
  { path: 'edit-place/:place_id', loadChildren: './edit-place/edit-place.module#EditPlacePageModule' },
  { path: 'place', loadChildren: './place/place.module#PlacePageModule' },
  { path: 'my-guides', loadChildren: './my-guides/my-guides.module#MyGuidesPageModule' },
  { path: 'input-value', loadChildren: './input-value/input-value.module#InputValuePageModule' },
  { path: 'reorder-places', loadChildren: './reorder-places/reorder-places.module#ReorderPlacesPageModule' },
  { path: 'guide-details/:id/:mode', loadChildren: './guide-details/guide-details.module#GuideDetailsPageModule' },
  { path: 'guide-details-edit/:id/:mode', loadChildren: './guide-details-edit/guide-details-edit.module#GuideDetailsEditPageModule' },
  { path: 'browse-file', loadChildren: './browse-file/browse-file.module#BrowseFilePageModule' },
  { path: 'buses', loadChildren: './buses/buses.module#BusesPageModule' },
];
@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
