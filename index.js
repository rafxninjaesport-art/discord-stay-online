// =================== AMBIL DATA DARI RAILWAY VARIABLES ===================
const token = process.env.TOKEN;
const channelId = process.env.CHANNEL_ID;
const statusText = "Sedang Online 24/7 | By Angga";
// =========================================================================

const { Client, GatewayIntentBits, ChannelType, ActivityType } = require('discord.js');
const { joinVoiceChannel } = require('@discordjs/voice');
const { createAudioPlayer, NoSubscriberBehavior } = require('@discordjs/voice');
const axios = require('axios');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMembers
    ]
});

// Saat Bot Siap
client.on('ready', async () => {
    console.log(`✅ LOGIN BERHASIL SEBAGAI: ${client.user.tag}`);
    console.log(`🔗 Mencoba masuk ke Voice Channel: ${channelId}`);

    // Cek apakah data Token & Channel udah masuk
    if (!token || !channelId) {
        console.log('❌ ERROR: TOKEN atau CHANNEL_ID belum dimasukin di Variables Railway!');
        return process.exit(1);
    }

    // Set Status Aktivitas
    client.user.setActivity(statusText, { type: ActivityType.Competing });

    // Fungsi Masuk Voice
    const masukVoice = () => {
        try {
            const saluran = client.channels.cache.get(channelId);
            if (!saluran || saluran.type !== ChannelType.GuildVoice) {
                console.log('❌ Channel Tidak Ditemukan / Bukan Voice!');
                return setTimeout(masukVoice, 5000);
            }

            const koneksi = joinVoiceChannel({
                channelId: saluran.id,
                guildId: saluran.guild.id,
                adapterCreator: saluran.guild.voiceAdapterCreator,
                selfDeaf: true, // ✨ Otomatis mati mikrofon (biar aman)
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
        axios.get(`https://${process.env.RAILWAY_STATIC_URL || 'localhost'}`)
        .catch(() => {}); // ✅ BAGIAN INI UDAH DIPERBAIKI, GAK ADA ERROR LAGI!
    }, 180000); // Setiap 3 menit di ping biar nyala terus
});

// Tangani Error biar gak mati
client.on('error', (e) => console.log('⚠️ ERROR KECIL:', e));
process.on('unhandledRejection', (alasan) => console.log('⚠️ DITOLAK:', alasan));

// Login Pakai Token dari Variabel
client.login(token);
