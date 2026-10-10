// One route module per platform, mounted at /api/<platform>.
const express = require('express');
const platformRouter = require('../lib/platformRouter');
const platforms = ['twitter', 'instagram', 'facebook', 'linkedin'].map(n => require(`../platforms/${n}`));
const router = express.Router();
router.get('/platforms', (req, res) => res.json(platforms.map(p => ({ name: p.name, label: p.label, charLimit: p.charLimit, needsImage: !!p.needsImage }))));
for (const p of platforms) router.use(`/${p.name}`, platformRouter(p));
module.exports = router;
