const { ApplicationCommandOptionType, ChannelType, PermissionFlagsBits } = require('discord.js');

module.exports = {
    name: 'create-confessionals',
    description: 'Create confessionals for select users',
    options: [
        {
            name: 'target-role',
            description: "Target role of select users you want confessionals made for",
            required: true,
            type: ApplicationCommandOptionType.Role,
        },
        {
            name: 'category-naming',
            description: "Category section naming scheme for confessionals",
            required: true,
            type: ApplicationCommandOptionType.String,
        },
        {
            name: 'trusted-specs-role',
            description: "The trusted spectator role that needs access to confessionals",
            required: false,
            type: ApplicationCommandOptionType.Role,
        },
        {
            name: 'production-role',
            description: "The production role that needs access to confessionals",
            required: false,
            type: ApplicationCommandOptionType.Role,
        },
    ],

    callback: async (client, interaction) => {
        await interaction.deferReply();
        let guild = client.guilds.cache.get(process.env.SERVER_ID);
        let channelsCreated = 0;
        let targetRoleId = interaction.options.get('target-role').value;
        let categoriesCreated = 1;
        let additionalPerms = [];

        let trustedRoleId;
        let productionRoleId;

        console.log(interaction.options.get('trusted-specs-role') !== null);
        if (interaction.options.get('trusted-specs-role') !== null) {
            trustedRoleId = interaction.options.get('trusted-specs-role').value;
            additionalPerms.push({
                id: trustedRoleId,
                allow: [PermissionFlagsBits.ViewChannel]
            })
        }
        if (interaction.options.get('production-role') !== null) {
            productionRoleId = interaction.options.get('production-role').value;
            additionalPerms.push({
                id: productionRoleId,
                allow: [PermissionFlagsBits.ViewChannel]
            })
        }

        try {
            await guild.members.fetch()
                .then(async (members) => {
                    let roleMembers = members.filter(m => m.roles.cache.get(targetRoleId));
                    let usedMembers = [];
                    let categoryNaming = interaction.options.get('category-naming');
                    let category = await guild.channels.create({name: `${categoryNaming.value} ${categoriesCreated}`, type: ChannelType.GuildCategory });
                    for (let mem of roleMembers) {
                        for (let otherMem of roleMembers) {
                            if (otherMem[1].user.id === mem[1].user.id || usedMembers.includes(otherMem[1].user.id)) {
                                continue;
                            } else {
                                if ( channelsCreated % 50 === 0) {
                                    ++categoriesCreated;
                                    category = await guild.channels.create({name: `${categoryNaming.value} ${categoriesCreated}`, type: ChannelType.GuildCategory });
                                }

                                let perms = [
                                    {
                                        id: guild.roles.everyone,
                                        deny: [PermissionFlagsBits.ViewChannel]
                                    },
                                    {
                                        id: mem[1].user.id,
                                        allow: [PermissionFlagsBits.ViewChannel]
                                    },
                                    {
                                        id: otherMem[1].user.id,
                                        allow: [PermissionFlagsBits.ViewChannel]
                                    },
                                    {
                                        id: interaction.user.id,
                                        allow: [PermissionFlagsBits.ViewChannel]
                                    }
                                ];

                                guild.channels.create({
                                    name: mem[1].user.username + '-' + otherMem[1].user.username,
                                    type: ChannelType.GuildText,
                                    parent: category.id,
                                    permissionOverwrites: perms.concat(additionalPerms)
                                });
                                ++channelsCreated;
                            }
                        }
                        usedMembers.push(mem[1].user.id);
                    }
                });

            await interaction.editReply(`${channelsCreated} channels created!`)
        } catch (e) {
            console.error(e);
        }


    }
}