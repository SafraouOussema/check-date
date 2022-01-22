import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
 import { Observable } from 'rxjs';

 @Injectable({
  providedIn: 'root'
})
export class FactureService {
  public API = 'https://juniorbackend.herokuapp.com/application';

  //  public API = 'http://localhost:8080/application';

    public factureAPI = this.API + '/facture';



    constructor(private http: HttpClient) {
    }


    /**
     * Gets all Facture
     * @returns all Facture 
     */
    getAllFacture(): Promise<any> {
        return this.http.get(this.API + '/facture').toPromise()
            .then(response => response as any);
    }

   
    /**
     * Saves Facture
     * @param niv 
     * @returns Facture 
     */
    saveFacture(niv: any): Promise<any> {
        return this.http.post(
            this.factureAPI,
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
     * Removes Facture
     * @param id 
     * @returns Facture 
     */
    removeFacture(id: any): Promise<any> {
        return this.http.delete(this.factureAPI+"/"+id).toPromise()
            .then(response => response as any);
    }


    

}
