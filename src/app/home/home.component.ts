import { Component, OnInit, Input } from '@angular/core';
import { Product } from '../models/product';
import { ProductService } from '../services/product.service';
import { ConfirmationService } from 'primeng/api';
import { MessageService } from 'primeng/api';

import { addDays, addMonths, differenceInDays, differenceInMonths, subDays, subMonths } from 'date-fns';



@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
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
          console.log(res)

          this.products.push(res);
          console.log(this.products)

          this.messageService.add({ severity: 'success', summary: 'Successful', detail: 'Product Created', life: 3000 });
        })
      }


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


  checkVliditeOfDate(begin: any, end: any) {
    begin = new Date(begin);
    end = new Date(end);
    let find = this.dateRange(begin, end)

    if (find.length < 6) {
      return "less than 6 month"

    } else if (find.length > 6 && find.length < 7) {
      return "more than 6 month and less than 7 month"

    } else if (find.length > 7) {
      return "more than 7 month"

    }
    return ""
  }



  dateRange(startDate: any, endDate: any): any {

    const months = differenceInMonths(endDate, startDate);
    return [...Array(months + 1).keys()].map((i) => addMonths(startDate, i));

  }

}
