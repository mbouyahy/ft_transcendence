import { setUpEvent } from './script.js';
import { gameComponent, gameAiComponent } from '../components/game.js';
import { gameStartingComponent, gameStartingComponentScript } from '../components/gameWaiting.js';
import { gameTournamentComponent, tournamentScript } from '../components/tournament.js';
import { gameScriptAi } from './game.js';
import { homeComponent, chartScript, drawCharts } from '../components/home.js';
import { SingUpComponent, singupScript } from '../components/singup.js';
import { SingInComponent, SingUpComponentScript } from '../components/singin.js';
import { ChatComponent, chatScript } from '../components/chat.js';
import { firstModeComponent, secondModeComponent, tournamentModesScript } from '../components/tournamentModes.js';
import { accountSettingComponent, accountSettingScript } from '../components/accountSetting.js';
import { friendsComponent, friendsScript } from '../components/friends.js';
import { profileComponent } from '../components/profile.js';
import { classicGame, classicGameComponent } from '../components/play.js';
import { searchComponent, searchComponentEvents } from '../components/search.js';
import { resetPasswordComponent, resetPasswordScript, newPasswordReset } from '../components/resetPassword.js';
import { ticTacToeComponent, ticTacToeBoard , ticTacToeDashboard } from '../components/tictactoe/tictactoe.js';
import { socket_management_ } from '../components/tictactoe/board.js'
import { tictactoe_getUser } from '../components/tictactoe/fetch.js'
import { manageEvents, closePopUp, playGameFrHome_, copyMatchKeyEvent } from '../components/tictactoe/events.js'
import { TicTacToeStatistics } from '../components/tictactoe/fetch.js'
import { globalState, fetchProfile } from './fetchData.js';

export async function urlHandler() {
    const routeName = window.location.pathname;
    const site = document.querySelector('.site');
    
    // check if user if logged in or not, if not redirect to login page
    if (routeName !== '/singin' && routeName !== '/singup' && routeName !== '/reset-password' && routeName !== '/new-password') {
        // check refresh_token if exitst in cookies
        if (document.cookie.indexOf('access_token' + '=') === -1) {
            history.pushState(null, null, '/singin');
            await urlHandler();
            return;
        }
    } else {
        if (document.cookie.indexOf('access_token' + '=') !== -1) {
            await fetchProfile();
            if (globalState.user) {
                history.pushState(null, null, '/');
                await urlHandler();
                return;
            }
        }
    }

    switch (routeName) {
        case '/':
            site.innerHTML = await homeComponent();
            site.classList = 'site gameComponent';
            chartScript();
            // CHECK
            drawCharts()
            break ;
        case '/index.html':
            site.innerHTML = await homeComponent();
            site.classList = 'site gameComponent';
            chartScript();
            // CHECK
            drawCharts()
            break;
        case '/game':
            site.innerHTML = await gameComponent();
            site.classList = 'site gameComponent';
            playGameFrHome_()
            break;
        case '/game_starting':
            site.innerHTML = await gameStartingComponent();
            site.classList = 'site';
            gameStartingComponentScript();
            break;
        case '/tournament':
            site.innerHTML = await gameTournamentComponent();
            site.classList = 'site';
            tournamentScript();
            break;
        case '/tournament-play':
            site.innerHTML = await gameAiComponent();
            site.classList = 'site';
            gameScriptAi(); 
            break;
        case '/game_setting':
            site.innerHTML = await gameSettingComponent();
            site.classList = 'site game-setting-layout';
            gameSettingScript();
            break;
        case '/singup':
            site.innerHTML = SingUpComponent();
            site.classList = 'site';
            singupScript();
            break;
        case '/singin':
            site.innerHTML = SingInComponent();
            site.classList = 'site';
            SingUpComponentScript();
            break;
        case '/chat':
            site.innerHTML = await ChatComponent();
            site.classList = 'site chat-layout';
            await chatScript();
            break;
        case '/first-mode':
            site.innerHTML = await firstModeComponent();
            site.classList = 'site';
            await tournamentModesScript();
            break;
        case '/second-mode':
            site.innerHTML = await secondModeComponent();
            site.classList = 'site';
            tournamentModesScript();
            break;
        case '/account_settings':
            site.innerHTML = await accountSettingComponent();
            site.classList = 'site account-setting-layout';
            await accountSettingScript()
            break;
        case '/friends':
            site.innerHTML = await friendsComponent();
            site.classList = 'site friends-layout';
            await searchComponentEvents();
            await friendsScript();
            break;
        case '/profile':
            site.innerHTML = await profileComponent();
            site.classList = 'site profile-layout';
            await searchComponentEvents();
            break;

        case '/play':
            site.innerHTML = await classicGameComponent();
            site.classList = 'site';
            await classicGame();
            break;

        case '/search':
            site.innerHTML = await searchComponent();
            site.classList = 'site friends-layout';
            await searchComponentEvents();
            break;

        case '/tic-tac':
            site.innerHTML = await ticTacToeComponent();
            site.classList = 'site';
            manageEvents();
            break;
        case '/tictactoe_board':
            site.innerHTML = await ticTacToeBoard();
            site.classList = 'site';
            const user = await tictactoe_getUser()
            socket_management_(user)
            closePopUp()
            copyMatchKeyEvent()
            break ;
        case '/dashboard':
            const data = await TicTacToeStatistics()
            site.innerHTML = await ticTacToeDashboard(data);
            site.classList = 'site';
            drawCharts()
            break;
        case '/reset-password':
            site.innerHTML = await resetPasswordComponent('reset-password');
            site.classList = 'site ';
            await resetPasswordScript()
            break;
        
        case '/new-password':
            site.innerHTML = await resetPasswordComponent('new-password');
            site.classList = 'site ';
            await newPasswordReset()
            break;
        
        default:
            site.innerHTML = `
                <h2 style="text-align: center; margin-top: 100px;">404 Page Not Found</h2>
            `;
            site.classList = 'site';
    }
    setUpEvent();
}

window.addEventListener('load', urlHandler);
window.onpopstate = urlHandler;