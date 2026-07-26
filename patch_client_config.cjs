const fs = require('fs');
let code = fs.readFileSync('src/components/ClientConfigurator.tsx', 'utf8');

const t1 = `  const [services, setServices] = useState<string[]>([]);
  const [newService, setNewService] = useState('');`;

const r1 = `  const [services, setServices] = useState<{name: string, price: string}[]>([]);
  const [newService, setNewService] = useState('');
  const [newServicePrice, setNewServicePrice] = useState('');`;

const t2 = `  const [facebookAccessToken, setFacebookAccessToken] = useState('');
  const [telegramBotToken, setTelegramBotToken] = useState('');`;

const r2 = `  const [facebookAccessToken, setFacebookAccessToken] = useState('');
  const [telegramBotToken, setTelegramBotToken] = useState('');
  const [wasenderAccessToken, setWasenderAccessToken] = useState('');
  const [wasenderWebhookSecret, setWasenderWebhookSecret] = useState('');`;

const t3 = `        setFacebookPageId(biz.facebookPageId || '');
        setFacebookAccessToken(biz.facebookAccessToken || '');
        setTelegramBotToken(biz.telegramBotToken || '');`;

const r3 = `        setFacebookPageId(biz.facebookPageId || '');
        setFacebookAccessToken(biz.facebookAccessToken || '');
        setTelegramBotToken(biz.telegramBotToken || '');
        setWasenderAccessToken(biz.wasenderAccessToken || '');
        setWasenderWebhookSecret(biz.wasenderWebhookSecret || '');`;

const t4 = `  // Add a new service
  const handleAddService = () => {
    if (newService.trim() && !services.includes(newService.trim())) {
      setServices([...services, newService.trim()]);
      setNewService('');
    }
  };`;

const r4 = `  // Add a new service
  const handleAddService = () => {
    if (newService.trim() && !services.some(s => s.name === newService.trim())) {
      setServices([...services, { name: newService.trim(), price: newServicePrice.trim() }]);
      setNewService('');
      setNewServicePrice('');
    }
  };`;

const t5 = `      facebookAccessToken,
      telegramBotToken,`;

const r5 = `      facebookAccessToken,
      telegramBotToken,
      wasenderAccessToken,
      wasenderWebhookSecret,`;

code = code.replace(t1, r1);
code = code.replace(t2, r2);
code = code.replace(t3, r3);
code = code.replace(t4, r4);
code = code.replace(t5, r5);

fs.writeFileSync('src/components/ClientConfigurator.tsx', code);
