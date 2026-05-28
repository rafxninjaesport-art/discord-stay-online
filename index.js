// =================== CONFIGURASI BOT ===================
const token = "MASUKKAN_TOKEN_DISCORD_LU_DISINI"; // ⚠️ GANTI BAGIAN INI!
const channelId = "MASUKKAN_ID_VOICE_CHANNEL_DISINI"; // ⚠️ GANTI BAGIAN INI!
const statusText = "Sedang Online 24/7 | By Angga"; // Bisa lu ganti nama statusnya
// ========================================================

const { Client, GatewayIntentBits, ChannelType, ActivityType } = require('discord.js');
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMembers
    ]
});

const { joinVoiceChannel } = require('@discordjs/voice');
const { createAudioPlayer, NoSubscriberBehavior } = require('@discordjs/voice');
const axios = require('axios');

// Saat Bot Siap
client.on('ready', async () => {
    console.log(`✅ LOGIN BERHASIL SEBAGAI: ${client.user.tag}`);
    console.log(`🔗 Mencoba masuk ke Voice Channel: ${channelId}`);

    // Set Status Aktivitas
    client.user.setActivity(statusText, { type: ActivityType.Competing });

    // Fungsi Masuk Voice
    const masukVoice = () => {
        try {
            const saluran = client.channels.cache.get(channelId);
            if (!saluran || saluran.type !== ChannelType.GuildVoice) return console.log('❌ Channel Tidak Ditemukan / Bukan Voice!');

            const koneksi = joinVoiceChannel({
                channelId: saluran.id,
                guildId: saluran.guild.id,
                adapterCreator: saluran.guild.voiceAdapterCreator,
                selfDeaf: true, // ✨ Ini biar lu otomatis mati suara (biar aman)
                selfMute: false
            });

            const pemain = createAudioPlayer({ behavior: NoSubscriberBehavior.Pause });
            koneksi.subscribe(pemain);
            console.log('🟢 BERHASIL MASUK VOICE CHANNEL! STAY 24/7 AKTIF!');

            // Auto Reconnect kalau terputus
            koneksi.on('disconnect', () => {
                console.log('🔴 PUTUS! MENCOBA HUBUNGKAN ULANG...');
                setTimeout(masukVoice, 5000);
            });

        } catch (err) {
            console.log('❌ ERROR:', err.message);
            setTimeout(masukVoice, 5000); // Coba lagi 5 detik kalau gagal
        }
    };

    masukVoice();

    // Sistem Anti Mati (Ping Diri Sendiri biar Railway gak tidur)
    setInterval(() => {
        axios.get('https://' + process.env.RAILWAY_STATIC_URL || 'localhost')
        .catch(() => => {});
    }, 180000); // Setiap 3 menit di ping biar nyala terus
});

// Tangani Error biar gak mati
client.on('error', (e) => console.log('⚠️ ERROR KECIL:', e));
process.on('unhandledRejection', (alasan) => console.log('⚠️ DITOLAK:', alasan));

// Login Pakai Token
client.login(token);