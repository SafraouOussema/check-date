import { Component, OnInit, Input } from '@angular/core';
import { Product } from '../models/product';
import { ProductService } from '../services/product.service';
import { ConfirmationService } from 'primeng/api';
import { MessageService } from 'primeng/api';

import { addDays, addMonths, differenceInDays, differenceInMonths,  subDays, subMonths} from 'date-fns';



@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  productDialog: boolean;

  products: Product[];

  product: Product;

  selectedProducts: Product[];

  submitted: boolean;

  constructor(private productService: ProductService, private messageService: MessageService, private confirmationService: ConfirmationService) { }

  ngOnInit() {

    this.productService.getAllProduit().then(data => {
      console.log(data);
      this.products = data;
    })

  }

  openNew() {
    this.product = {};
    this.submitted = false;
    this.productDialog = true;
  }


  deleteSelectedProducts() {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete the selected products?',
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.products = this.products.filter(val => !this.selectedProducts.includes(val));
        this.selectedProducts = null;
        this.messageService.add({ severity: 'success', summary: 'Successful', detail: 'Products Deleted', life: 3000 });
      }
    });
  }

  editProduct(product: Product) {
    this.product = { ...product };
    this.productDialog = true;

  }

  deleteProduct(product: Product) {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete ' + product.name + '?',
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.productService.removeProduit(product.id).then(res => {
          this.products = this.products.filter(val => val.id !== product.id);
          this.product = {};
          this.messageService.add({ severity: 'success', summary: 'Successful', detail: 'Product Deleted', life: 3000 });
        });
      }
    });
  }

  hideDialog() {
    this.productDialog = false;
    this.submitted = false;
  }

  saveProduct() {
    this.submitted = true;

    if (this.product.name.trim()) {
      if (this.product.id) {
        this.productService.updateProduit(this.product).then(res => {
          this.products[this.findIndexById(this.product.id)] = this.product;
          this.messageService.add({ severity: 'success', summary: 'Successful', detail: 'Product Updated', life: 3000 });

        })
      }
      else {
        this.productService.saveProduit(this.product).then(res => {
          this.products.push(this.product);
          this.messageService.add({ severity: 'success', summary: 'Successful', detail: 'Product Created', life: 3000 });
        })
      }

      this.products = [...this.products];
      this.productDialog = false;
      this.product = {};
    }
  }

  findIndexById(id: number): number {
    let index = -1;
    for (let i = 0; i < this.products.length; i++) {
      if (this.products[i].id === id) {
        index = i;
        break;
      }
    }

    return index;
  }


  checkVliditeOfDate(begin:any,end:any){
    begin = new Date(begin);
    end = new Date(end);
    let find = this.dateRange(begin,end,"MONTH")
console.log(find)
    return "good"
  }


  calculateDiff(begin: any, end: any) {
    begin = new Date(begin);
    end = new Date(end);
    let result = Math.floor((Date.UTC(end.getFullYear(), end.getMonth(), end.getDate()) - Date.UTC(begin.getFullYear(), begin.getMonth(), begin.getDate())) / (1000 * 60 * 60 * 24));
    return result
  }

   dateRange(startDate : any, endDate :any, interval :any): any {
    if (interval === "DAY") {
      const days = differenceInDays(endDate, startDate);
      return [...Array(days + 1).keys()].map((i) => addDays(startDate, i));
    }

    if (interval === "MONTH") {
      const months = differenceInMonths(endDate, startDate);
      return [...Array(months + 1).keys()].map((i) => addMonths(startDate, i));
    }
  }

}
