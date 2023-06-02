import { Component, Input } from '@angular/core';
import { ActionSheetButton, ActionSheetController, Platform } from '@ionic/angular';

import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';
import { SocialSharing } from '@ionic-native/social-sharing/ngx'

import { StorageService } from '../../services/storage.service';

import { Article } from '../../interfaces';


@Component({
  selector: 'app-article',
  templateUrl: './article.component.html',
  styleUrls: ['./article.component.scss'],
})
export class ArticleComponent {

  @Input() article: Article;
  @Input() index: number;

  constructor(
    private iab: InAppBrowser,
    private platform: Platform,
    private actionSheetCtrl: ActionSheetController,
    private socialSharing: SocialSharing,
    private storageService: StorageService,
  ) { }

  openArticle() {

    if (this.platform.is('ios') || this.platform.is('android')) {
      const browser = this.iab.create(this.article.url);
      browser.show();
      return;
    }

    window.open(this.article.url, '_blank');

  }


  async onOpenMenu() {

    const articleInFavorite = this.storageService.articleInFavorites(this.article);

    let normalBtns: ActionSheetButton[] = [
      {
        text: articleInFavorite ? 'Remover favorito' : 'Favorito',
        icon: articleInFavorite ? 'heart' : 'heart-outline',
        handler: () => this.onToggleFavorite()
      },
      {
        text: 'Cancelar',
        icon: 'close-outline',
        role: 'cancel',
      }
    ]

    const shareBtn: ActionSheetButton = {
      text: 'Compartir',
      icon: 'share-outline',
      handler: () => this.onShareArticle()
    };

    // if (this.platform.is('capacitor')) {
    //   normalBtns.unshift(shareBtn);
    // }

    normalBtns.push(shareBtn);


    const actionSheet = await this.actionSheetCtrl.create({
      header: 'Opciones',
      buttons: normalBtns
    });



    await actionSheet.present();

  }

  onShareArticle() {

    const { title, source, url } = this.article;

    if (this.platform.is("capacitor")) {
      this.socialSharing.share(
        title,
        source.name,
        null,
        url
      );
    // } else if (this.platform.is("pwa")) {
    } else {
      if (navigator.share) {
        navigator.share({
          title,
          text: this.article.description,
          url,
        })
          .then(() => console.log('Successful share'))
          .catch((error) => console.log('Error sharing', error));
      } else {
        alert("Dont support this option. Talk to stupid admin to fix this...");
      }
    }


  }

  onToggleFavorite() {
    this.storageService.saveRemoveArticle(this.article);
  }

}
