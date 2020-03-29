/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import { Stream } from './stream';
import { Peer } from './peer';


/**
 * @module rtc
 */
/**
 * @class rtc.MediaDomElement
 */
export class MediaDomElement {
  dom: HTMLVideoElement | HTMLAudioElement;
  stream?: Stream;
  cleanup?: () => void;

  constructor(dom: HTMLVideoElement | HTMLAudioElement, data: Peer | Stream | Promise<Stream> | null) {
    this.dom = dom;
    // TODO
    //if (this.dom.jquery != null) {
      //// TODO: warn if less/more than one element
      //this.dom = this.dom[0];
    //}

    this.attach(data);
  }


  attach(data?: null | Peer | Stream | Promise<Peer> | Promise<Stream>): void {
    if(this.cleanup != null) {
      this.cleanup();
      delete this.cleanup;
    }

    delete this.stream;

    // TODO: handle conflict between multiple calls
    if ((data == null)) {
      this.dom.src = "";

    } else if (data instanceof Stream) {
      this.stream = data;
      this.dom.srcObject = data.stream;

    } else if (data instanceof Peer) {
      if (data.isLocal()) {
        this.mute();
      }

      const changeCb = () => {
	console.log("stream changed");
	this.attach(data.stream());
      };

      data.on("streams_changed", changeCb);

      this.attach(data.stream());

      this.cleanup = () => {
	console.log("change cleanup");
	data.removeListener("streams_changed", changeCb);
      };

    } else if ('then' in data) {
      // TODO
      (<Promise<Peer|Stream>>data).then((res: Peer | Stream) => {
        this.attach(res);
      }).catch((err: Error) => {
        this.error(err);
      });

    } else {
      this.error(Error("Tried to attach invalid data"));
    }
  }


  error(err: Error) {
    // TODO: do more with dom
    return console.log(err);
  }


  clear() {
    return this.attach();
  }


  mute(muted?: boolean) {
    if (muted == null) { muted = true; }
    return this.dom.muted = muted;
  }


  toggleMute() {
    return this.dom.muted = !this.dom.muted;
  }
};
