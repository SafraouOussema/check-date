import { Component, OnInit, Input } from '@angular/core';
import { Product } from '../models/product';
import { Facture } from '../models/facture';
import { ConfirmationService } from 'primeng/api';
import { MessageService } from 'primeng/api';
import { DatePipe, registerLocaleData } from '@angular/common';
import localeFr from '@angular/common/locales/fr';
import { addDays, addMonths, differenceInDays, differenceInMonths, subDays, subMonths } from 'date-fns';

import * as moment from 'moment';

import { LocaleConfig } from 'ngx-daterangepicker-material';
import * as dayjs from 'dayjs';


import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";


import { FactureService } from '../services/facture.service';
import { ProductService } from '../services/product.service';



@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  productDialog: boolean;
  factureDialog: boolean;
  deliveryDialog: boolean;
  isUpdate: boolean;

  products: Product[];

  product: Product;

  selectedProducts: Product[];

  submitted: boolean;

  exportColumns: any[];

  facture: Facture;
  addFacture: Facture;

  selectedDelivery: number;

  first = 0;
  rows = 10;
  alwaysShowCalendars: boolean

  selectedDePeremption: any;
  selectedDeFabrication: any;
  selectedDeFacture: any;





  constructor(private productService: ProductService,
    private messageService: MessageService,
    private factureService: FactureService,
    private confirmationService: ConfirmationService,
    private datePipe: DatePipe

  ) { }

  ngOnInit() {
    registerLocaleData(localeFr, 'fr');
    this.datePipe = new DatePipe("fr");
    this.alwaysShowCalendars = true;

    this.loadAllData();

    this.factureService.getAllFacture().then(res => {
      this.facture = res[0];
    })
  }

  loadAllData() {
    this.productService.getAllProduit().then(data => {

      this.products = data;

      this.products.forEach(element => {

        element.validDate = this.checkVliditeOfDate(element.dateDeFabrication, element.dateDePeremption);
        element.nbrDate = this.calculateNumberOfDay(element.dateDeFabrication, element.dateDePeremption)
        element.day = this.findMidelDqy(element.dateDeFabrication, element.dateDePeremption)
      })

    })
  }



  locale: LocaleConfig = {
    applyLabel: 'Appliquer',
    customRangeLabel: ' - ',
    daysOfWeek: moment.weekdaysMin(),
    monthNames: moment.monthsShort(),
    firstDay: moment.localeData().firstDayOfWeek(),
  }

  openNew() {
    this.product = {};
    this.submitted = false;
    this.productDialog = true;
    this.isUpdate = false;
    this.selectedDePeremption = null;
    this.selectedDeFabrication = null;
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
    this.isUpdate = true;


    this.selectedDePeremption = {
      startDate: new Date(this.product.dateDePeremption),
      endDate: new Date(this.product.dateDePeremption)
    }

    this.selectedDeFabrication = {
      startDate: new Date(this.product.dateDeFabrication),
      endDate: new Date(this.product.dateDeFabrication)
    }
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
    this.selectedDePeremption = null;
    this.selectedDeFabrication = null;

  }


  saveProduct() {
    this.submitted = true; 
    if (this.isUpdate == false) {
      this.product.dateDePeremption = this.datePipe.transform(this.selectedDePeremption.endDate._d, "yyyy-MM-dd")
      this.product.dateDeFabrication = this.datePipe.transform(this.selectedDeFabrication.endDate._d, "yyyy-MM-dd")
    } else {

      this.product.dateDePeremption = this.datePipe.transform(this.selectedDePeremption.endDate, "yyyy-MM-dd")
      this.product.dateDeFabrication = this.datePipe.transform(this.selectedDeFabrication.endDate, "yyyy-MM-dd")
    } console.log(this.product)
 
    if (this.product.delivery != undefined && this.product.delivery != null && this.product.name != undefined && this.product.name != null && this.product.code != undefined && this.product.code != null && this.product.dateDeFabrication != undefined && this.product.dateDeFabrication != null && this.product.dateDePeremption != undefined && this.product.dateDePeremption != null) {

      if (this.product.name.trim()) {
        if (this.product.id) {
          this.productService.updateProduit(this.product).then(res => {
            this.products[this.findIndexById(this.product.id)] = this.product;
            this.messageService.add({ severity: 'success', summary: 'Successful', detail: 'Produit mise a jour', life: 3000 });
            location.reload();

          })
        }
        else {
          this.productService.saveProduit(this.product).then(res => {
            this.products.push(res);
            this.messageService.add({ severity: 'success', summary: 'Successful', detail: 'Produit ajouter', life: 3000 });
            location.reload();

          })
        }
      }

      this.productDialog = false;
      this.product = {};
    }

    else {
      this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Tous les champs sont obligatoires', life: 3000 });

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

  openNewFacture() {
    this.factureDialog = true;
    this.addFacture = {};

  }

  hideDialogFacture() {
    this.factureDialog = false;
  }

  saveFacture() {

    if (this.facture != undefined && this.facture != null) {
      this.addFacture.dateOfFacture = this.datePipe.transform(this.selectedDeFacture.endDate._d, "yyyy-MM-dd")

      this.factureService.removeFacture(this.facture.id).then(res => {
        this.factureService.saveFacture(this.addFacture).then(res => {
          this.facture = res;
          this.messageService.add({ severity: 'success', summary: 'Successful', detail: 'Facture ajouter', life: 3000 });
          this.selectedDeFacture = null
        })

      })
    } else {
      this.addFacture.dateOfFacture = this.datePipe.transform(this.selectedDeFacture.endDate._d, "yyyy-MM-dd")
      this.factureService.saveFacture(this.addFacture).then(res => {
        this.facture = res;
        this.messageService.add({ severity: 'success', summary: 'Successful', detail: 'Facture ajouter', life: 3000 });
        this.selectedDeFacture = null
      })
    }
    this.factureDialog = false;


  }


  openNewDelivery() {
    this.deliveryDialog = true;
  }

  hideDialogDelivery() {
    this.deliveryDialog = false;
  }

  saveDelivery() {
    if (this.selectedDelivery == undefined && this.selectedDelivery == null) {
      console.log("error")
    } else {
      this.productService.getProduitByDelivery(this.selectedDelivery).then(data => {
        this.products = data;

        this.products.forEach(element => {

          element.validDate = this.checkVliditeOfDate(element.dateDeFabrication, element.dateDePeremption);
          element.nbrDate = this.calculateNumberOfDay(element.dateDeFabrication, element.dateDePeremption)
          element.day = this.findMidelDqy(element.dateDeFabrication, element.dateDePeremption)
        })

      })
    }
    this.deliveryDialog = false;


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
      { dataKey: 'day', header: 'Jour Valide' },
    ];
    let bodys: any[] = [];
    this.products.forEach(element => {
      let row = [element.name, element.code, element.quantite, element.dateDeFabrication, element.dateDePeremption, element.validDate, element.nbrDate, element.day]
      bodys.push(row)
    })


    setTimeout(() => {
      this.export(bodys)
    }, 100);

  }

  export(bodys: any) {
    const doc = new jsPDF();

    const pageWidth = doc.internal.pageSize.width; //Optional
    const pageHeight = doc.internal.pageSize.height; //Optional
    let horizontalPos = pageWidth / 2; //Can be fixed number
    let verticalPos = pageHeight - 10; //Can be fixed number

    doc.setFont('bold');
    doc.setFontSize(22);
    doc.text("Plaisir du Chocolat", horizontalPos, 15, {
      align: 'center'
    });
    doc.setFont('normal')
    doc.setFontSize(14);

    doc.text('Les Berges du Lac 1', 20, 25)

    doc.text('Immeuble Junior', 20, 35)

    doc.text('1053 Tunis', 20, 45)

    doc.text('Tunisie', 20, 55)

    let pdfWidth = doc.internal.pageSize.getWidth();
    doc.text("Numéro de facture : " + this.facture.numberOfFacture, pdfWidth - 100, 25);
    doc.text("Date de facture : " + this.datePipe.transform(this.facture.dateOfFacture, "yyyy-MM-dd"), pdfWidth - 100, 35);


    autoTable(doc, { columns: this.exportColumns, body: bodys, margin: { top: 75 }, theme: 'grid' });

    doc.save("PlaisirDuChocolat.pdf");
  }



  imprimerPdf() {


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
    let bodys: any[] = [];
    this.products.forEach(element => {
      let row = [element.name, element.code, element.quantite, element.dateDeFabrication, element.dateDePeremption, element.validDate, element.nbrDate, element.day]
      bodys.push(row)
    })


    setTimeout(() => {
      this.imprimerPdfData(bodys)
    }, 100);

  }

  imprimerPdfData(bodys: any) {
    const doc = new jsPDF();

    const pageWidth = doc.internal.pageSize.width; //Optional
    const pageHeight = doc.internal.pageSize.height; //Optional
    let horizontalPos = pageWidth / 2; //Can be fixed number
    let verticalPos = pageHeight - 10; //Can be fixed number

    doc.setFont('bold');
    doc.setFontSize(22);
    doc.text("Plaisir du Chocolat", horizontalPos, 15, {
      align: 'center'
    });
    doc.setFont('normal')
    doc.setFontSize(14);

    doc.text('Les Berges du Lac 1', 20, 25)

    doc.text('Immeuble Junior', 20, 35)

    doc.text('1053 Tunis', 20, 45)

    doc.text('Tunisie', 20, 55)

    let pdfWidth = doc.internal.pageSize.getWidth();
    doc.text("Numéro de facture : " + this.facture.numberOfFacture, pdfWidth - 100, 25);
    doc.text("Date de facture : " + this.datePipe.transform(this.facture.dateOfFacture, "yyyy-MM-dd"), pdfWidth - 100, 35);



    autoTable(doc, { columns: this.exportColumns, body: bodys, margin: { top: 75 }, theme: 'grid' });
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
