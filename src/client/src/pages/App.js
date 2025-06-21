import BotStatus from '../components/BotStatus';
import DiscordLogin from '../components/DiscordLogin';

function App() {
  console.log(process.env.REACT_APP_OAUTH_URL)
  return (
    <div> 
      <DiscordLogin />
      <BotStatus />
    </div>
  );
}

export default App;
