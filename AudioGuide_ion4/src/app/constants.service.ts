import { Injectable } from '@angular/core';
import { getClosureSafeProperty } from '@angular/core/src/util/property';

export const GUIDE_DETAILS_EMPTY = {
  guide_uuid: "",
  guide_name: "",
  description: "",
  images: [],
  audioFile: "",
  videoFile: "",
  mode: '1',  // 1 = online, 2 = offline
  places: [],
  lines: []
}

export const PLACE_DETAILS_EMPTY = {
  description: "",
  images: [],
  audioFile: "",
  videoFile: "",
}

export const WDF_GEOPOS = {lat: 49.299113, lng: 8.643907};

export const COLORS = ['#C0392B', '#4A235A', '#154360', '#0E6251', '#145A32', '#17202A', '#000000', '#0000FF'];


@Injectable({
  providedIn: 'root'
})
export class Constants {

  public static MAPS_API_KEY = "";

  public static COL_CIRCLE_NORM = 'rgba(128, 128, 128, 1)';
  public static COL_CIRCLE_SEL = 'rgba(0, 0, 255, 1)';
  public static COL_CIR_FILL_NORM = 'rgba(0, 0, 255, 0.3)';
  public static COL_CIR_FILL_SEL = 'rgba(255, 0, 0, 0.3)';

  public static COL_BK_MAIN = "#3c5064";
  public static COL_MAIN = "#FFFFFF";

  public static COL_LINE_NORM = '#AA00FF';
  public static COL_LINE_SEL = '#FF0000';

  public static KEY_VIDEO_FILE = "VIDEO_FILE";
  public static KEY_AUDIO_FILE = "AUDIO_FILE";
  public static KEY_IMAGE_FILE = "IMAGE_FILE";


  constructor() { }

  static iCol = -1;
  static getNextColor() {
    Constants.iCol = Constants.iCol > COLORS.length - 1 ? 0 : ++this.iCol;
    return COLORS[this.iCol];
  }

  static getColor(i) {
    return COLORS[i % COLORS.length];
  }

}
