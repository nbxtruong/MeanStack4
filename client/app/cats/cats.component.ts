import { Component, OnInit, Pipe } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';

import { CatService } from '../services/cat.service';
import { ToastComponent } from '../shared/toast/toast.component';

@Component({
  selector: 'app-cats',
  templateUrl: './cats.component.html',
  styleUrls: ['./cats.component.scss']
})

@Pipe({
  name: 'reverse',
  pure: false
})
export class CatsComponent implements OnInit {

  cat = {};
  myCat;
  cats = [];
  isLoading = true;
  isEditing = false;
  public webcam;//will be populated by ack-webcam [(ref)]

  addCatForm: FormGroup;
  username = new FormControl('', Validators.required);
  name = new FormControl('', Validators.required);
  room = new FormControl('', Validators.required);
  role = new FormControl('', Validators.required);
  searchFilter='userid';
  identifiedUser;
  filterModel;

  searchCategory= [{
    id:'userid',
    value:'UserID'
    },{
    id:'username',
    value:'Username'
  },{
    id:'photo',
    value:'Photo'
  }];

  // Options for webcam
  options = {
    audio: false,
    video: true,
    // width: 500,
    // height: 500,
    fallbackMode: 'callback',
    fallbackSrc: 'jscam_canvas_only.swf',
    fallbackQuality: 100,
    cameraType: 'front'
  }

  constructor(private catService: CatService,
    private formBuilder: FormBuilder,
    public toast: ToastComponent,
    private router: Router) { }

  ngOnInit() {
    this.getCats();
    this.addCatForm = this.formBuilder.group({
      username: this.username,
      name: this.name,
      room: this.room,
      role: this.role
    });
  }

  getCats() {
    this.catService.getCats().subscribe(
      data => this.cats = data.reverse(),
      error => console.log(error),
      () => this.isLoading = false
    );
  }

  addCat() {
    this.router.navigate(['/addPeople']);
  }

  enableEditing(cat) {
    this.isEditing = true;
    this.cat = cat;
    this.myCat = cat;
  }

  cancelEditing() {
    this.isEditing = false;
    this.cat = {};
    this.toast.setMessage('item editing cancelled.', 'warning');
    // reload the cats to reset the editing
    this.getCats();
  }

  editCat(cat) {
    this.catService.editCat(cat).subscribe(
      res => {
        this.isEditing = false;
        this.cat = cat;
        this.toast.setMessage('item edited successfully.', 'success');
      },
      error => console.log(error)
    );
  }

  deleteCat(cat) {
    if (window.confirm('Are you sure you want to permanently delete this item?')) {
      this.catService.deleteCat(cat).subscribe(
        res => {
          const pos = this.cats.map(elem => elem._id).indexOf(cat._id);
          this.cats.splice(pos, 1);
          this.toast.setMessage('item deleted successfully.', 'success');
        },
        error => console.log(error)
      );
    }
  }

  getFilter(f){
    this.searchFilter=f;
  }

  searchPeopleByName() {
    console.log(this.searchFilter);
    // Declare variables 
    var input, filter, table, tr, td, i;
    input = document.getElementById("myInput");
    filter = input.value.toUpperCase();
    table = document.getElementById("myTable");
    tr = table.getElementsByTagName("tr");

    // Loop through all table rows, and hide those who don't match the search query
    for (i = 0; i < tr.length; i++) {
      var tdArray=tr[i].getElementsByTagName("td");
      //console.log(tdArray);
      for (var j=0;j<tdArray.length;j++){
        if (tdArray[j]&&tdArray[j].getAttribute('value')==this.searchFilter){
          //console.log(tdArray[j].getAttribute('value'));
          td=tdArray[j];
          break;
        }
      }
      
      //td = tr[i].getElementsByTagName("td")[0];
      //console.log(td);
      if (td) {
        if (td.innerHTML.toUpperCase().indexOf(filter) > -1) {
          tr[i].style.display = "";
        } else {
          tr[i].style.display = "none";
        }
      }
    }
  }

  // Start photo prosessing
  // Base64 Generation
  genBase64() {
    this.webcam.getBase64()
      .then(base => {
        this.identifyAndUpdate(base);
      })
      .catch(e => console.error(e))
  }

  identifyUser(base) {
    const messageBody = {
      image64: base,
      imagename: 'photo' + [0]
    }
    this.catService.identifyCatPhotos(messageBody).subscribe(
      res => {
        console.log(JSON.parse(res._body));
        return res._body;
      },
      error => {
        console.log(error);
      }
    );
  }

  identifyAndUpdate(base) {
    const messageBody = {
      image64: base,
      imagename: 'photo' + [0]
    }
    this.catService.identifyCatPhotos(messageBody).subscribe(
      res => {
        console.log(JSON.parse(res._body));
        var user=JSON.parse(res._body);
        if (user.id!=-1) {
          var filter,input;
          filter=document.getElementById('filter');
          input = document.getElementById("myInput");
          filter.value='userid';
          input.value=user.id;
          this.searchPeopleByName();
        }
      },
      error => {
        console.log(error);
      }
    );
  }

  checkIfPhoto(t){
    console.log(this.filterModel);
    if (t=='photo'){
      console.log("photo filter");
    }
  }

  onCamError(err) { }

  onCamSuccess() { }
  // End photo processing

}
