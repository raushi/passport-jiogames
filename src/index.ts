import { Request, Response } from 'express';
import { StrategyCreatedStatic } from 'passport';

type VerifyCallback = (
  payload: any,
  verifyCallback: (err?: Error, user?: Object, info?: any) => void,
  req: Request
) => void;

interface Options {
  sendOtp: (
    destination: string,
    req: Request
  ) => Promise<void>;
  verify: VerifyCallback;
}

class JioGamesStrategy {
  name: string = 'jiogames';

  constructor(private _options: Options) { }

  authenticate(
    this: StrategyCreatedStatic & JioGamesStrategy,
    req: Request
  ): void {
    const self = this;
    const payload = req.method === 'GET' ? req.query : req.body;

    const verifyCallback = function (err?: Error, user?: Object, info?: any) {
      if (err) {
        return self.error(err);
      } else if (!user) {
        return self.fail(info);
      } else {
        return self.success(user, info);
      }
    };

    self._options.verify(payload, verifyCallback, req);
  }

  send = (req: Request, res: Response): void => {
    const payload = req.method === 'GET' ? req.query : req.body;
    if (!payload.destination) {
      res.status(400).send('Please specify the destination.');
      return;
    }

    this._options
      .sendOtp(
        payload.destination,
        req
      )
      .then(() => {
        res.json({ success: true });
      })
      .catch((error: any) => {
        console.error(error);
        res.json({ success: false, error });
      });
  };
}

export default JioGamesStrategy;
