import { Component, OnInit, Input } from '@angular/core';
import { Product } from '../models/product';
import { ProductService } from '../services/product.service';
import { ConfirmationService } from 'primeng/api';
import { MessageService } from 'primeng/api';
import { DatePipe, registerLocaleData } from '@angular/common';
import localeFr from '@angular/common/locales/fr';

import { addDays, addMonths, differenceInDays, differenceInMonths, subDays, subMonths } from 'date-fns';

import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";




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

  exportColumns: any[];

  first = 0;
  rows = 10;
  constructor(private productService: ProductService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private datePipe: DatePipe

  ) { }

  ngOnInit() {
    registerLocaleData(localeFr, 'fr');
    this.datePipe = new DatePipe("fr");
    this.productService.getAllProduit().then(data => {

      this.products = data;

      this.products.forEach(element => {

        element.validDate = this.checkVliditeOfDate(element.dateDeFabrication, element.dateDePeremption);
        element.nbrDate = this.calculateNumberOfDay(element.dateDeFabrication, element.dateDePeremption)
        element.day = this.findMidelDqy(element.dateDeFabrication, element.dateDePeremption)
      })

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
          this.products.push(res);
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

    let dateDiff = this.dateDiff(begin, end)

    return dateDiff;
  }


  dateRange(startDate: any, endDate: any): any {

    const months = differenceInMonths(endDate, startDate);

    return [...Array(months + 1).keys()].map((i) => addMonths(startDate, i));

  }


  calculateNumberOfDay(begin: any, end: any) {
    begin = new Date(begin);
    end = new Date(end);
    const days = differenceInDays(end, begin);

    return days
  }


  findMidelDqy(begin: any, end: any) {

    if (begin != null && end != null) {

      begin = new Date(begin);
      end = new Date(end);

      const days = differenceInDays(end, begin);
      let list = [...Array(days + 1).keys()].map((i) => addDays(begin, i));
      let midle = Math.floor(list.length / 2)


      return this.datePipe.transform(new Date(list[midle]), 'fullDate')
    }
    else {
      return ''
    }
  }

  exportPdf() {
   

    this.exportColumns = [
      { dataKey: 'name', header: 'Name' },
      { dataKey: 'code', header: 'Code' },
      { dataKey: 'quantity', header: 'Quantity' },
      { dataKey: 'dateDeFabrication', header: 'Date de fabrication' },
      { dataKey: 'dateDePeremption', header: 'Date de peremption' },
      { dataKey: 'validDate', header: 'Validité de date' },
      { dataKey: 'nbrDate', header: 'Nombre de jour' },
      { dataKey: 'day', header: 'Jour' },
    ];
    let bodys: any[]=[];
    this.products.forEach(element => {
      let row = [element.name, element.code, element.quantite, element.dateDeFabrication, element.dateDePeremption, element.validDate, element.nbrDate, element.day]
      bodys.push(row)
    })

    
setTimeout(() => {
  this.export(bodys)
}, 100);

  }

  export(bodys: any){
    const doc = new jsPDF();
    autoTable(doc, { columns: this.exportColumns, body: bodys, theme: 'grid' });

    doc.save("PlaisirDuChocolat.pdf");
  }

  imprimerPdf() {
    const doc = new jsPDF();
    autoTable(doc, { html: '.p-datatable-table', theme: 'grid' });
    doc.autoPrint();
    doc.output('dataurlnewwindow');
  }


  getMonthsBetween(date1: any, date2: any, roundUpFractionalMonths: any) {
    //Months will be calculated between start and end dates.
    //Make sure start date is less than end date.
    //But remember if the difference should be negative.
    var startDate = date1;
    var endDate = date2;
    var inverse = false;
    if (date1 > date2) {
      startDate = date2;
      endDate = date1;
      inverse = true;
    }

    //Calculate the differences between the start and end dates
    var yearsDifference = endDate.getFullYear() - startDate.getFullYear();
    var monthsDifference = endDate.getMonth() - startDate.getMonth();
    var daysDifference = endDate.getDate() - startDate.getDate();

    var monthCorrection = 0;
    //If roundUpFractionalMonths is true, check if an extra month needs to be added from rounding up.
    //The difference is done by ceiling (round up), e.g. 3 months and 1 day will be 4 months.
    if (roundUpFractionalMonths === true && daysDifference > 0) {
      monthCorrection = 1;
    }
    //If the day difference between the 2 months is negative, the last month is not a whole month.
    else if (roundUpFractionalMonths !== true && daysDifference < 0) {
      monthCorrection = -1;
    }

    return (inverse ? -1 : 1) * (yearsDifference * 12 + monthsDifference + monthCorrection);
  }

  dateDiff(startingDate: any, endingDate: any) {
    var startDate = new Date(new Date(startingDate).toISOString().substr(0, 10));
    if (!endingDate) {
      endingDate = new Date().toISOString().substr(0, 10);    // need date in YYYY-MM-DD format
    }
    var endDate = new Date(endingDate);
    if (startDate > endDate) {
      var swap = startDate;
      startDate = endDate;
      endDate = swap;
    }
    var startYear = startDate.getFullYear();
    var february = (startYear % 4 === 0 && startYear % 100 !== 0) || startYear % 400 === 0 ? 29 : 28;
    var daysInMonth = [31, february, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

    var yearDiff = endDate.getFullYear() - startYear;
    var monthDiff = endDate.getMonth() - startDate.getMonth();
    if (monthDiff < 0) {
      yearDiff--;
      monthDiff += 12;
    }
    var dayDiff = endDate.getDate() - startDate.getDate();
    if (dayDiff < 0) {
      if (monthDiff > 0) {
        monthDiff--;
      } else {
        yearDiff--;
        monthDiff = 11;
      }
      dayDiff += daysInMonth[startDate.getMonth()];
    }

    return yearDiff + ' annee ' + monthDiff + ' mois ' + dayDiff + ' jour';
  }

  isLastPage(): boolean {
    return this.products ? this.first === (this.products.length - this.rows) : true;
  }

  next() {
    this.first = this.first + this.rows;
  }

}
