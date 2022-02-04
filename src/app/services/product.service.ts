import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { Product } from '../models/product';
@Injectable({
    providedIn: 'root'
})
export class ProductService {

    public API = 'https://juniorbackend.herokuapp.com/application';

  // public API = 'http://localhost:8080/application';

    public produitAPI = this.API + '/produit';



    constructor(private http: HttpClient) {
    }


    /**
     * Gets all produit
     * @returns all produit 
     */
    getAllProduit(): Promise<any> {
        return this.http.get(this.API + '/produits').toPromise()
            .then(response => response as any);
    }

    /**
     * Gets produit by id
     * @param id 
     * @returns  
     */
    getProduitById(id: string) {
        return this.http.get(this.produitAPI + id, { responseType: 'json' }).toPromise()
            .then(response => response as any);
    }

  
    
  getProduitByDelivery(code: number) {
    return this.http.get(this.produitAPI + "/delivery/" + code, { responseType: 'json' }).toPromise()
        .then(response => response as any);
}

    /**
     * Saves produit
     * @param niv 
     * @returns produit 
     */
    saveProduit(niv: any): Promise<any> {
        return this.http.post(
            this.produitAPI,
            niv,
            {
                headers:
                {
                    'Content-Type': 'application/json'
                }
            }
        ).toPromise()
            .then(response => response as any);
    }

    /**
     * Updates produit
     * @param produit 
     * @returns produit 
     */
    updateProduit(produit: any): Promise<any> { 
        return this.http.post(this.produitAPI, produit).toPromise()
            .then(response => response as any); 
    }


    /**
     * Removes produit
     * @param id 
     * @returns produit 
     */
    removeProduit(id: any): Promise<any> {
        return this.http.delete(this.produitAPI+"/"+id).toPromise()
            .then(response => response as any);
    }


    

}
