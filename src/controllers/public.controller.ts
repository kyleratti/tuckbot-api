import { Router, Request, Response } from 'express';

const router: Router = Router();

router.get('/', (req: Request, res: Response) => {
    // TODO: show home page (? if any???)
    res.send('Hello, world!');
});

router.get('/:redditPostId', (req: Request, res: Response) => {
    let redditPostId = req.params.redditPostId;
    res.send('Hello reddit post ' + redditPostId);
});

export const PublicController: Router = router;
