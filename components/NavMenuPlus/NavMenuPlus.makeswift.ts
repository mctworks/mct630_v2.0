import { runtime } from '@/lib/makeswift/runtime';
import { 
    List, 
    Link, 
    Checkbox,
    TextInput, 
    Style, 
    Group, 
    Image,
    Slot,
    Number,
    Select,
    Color,
} from '@makeswift/runtime/controls';
import { ComponentIcon } from '@makeswift/runtime';
import NavMenuPlus from './NavMenuPlus';


runtime.registerComponent(NavMenuPlus, {
    type: 'navigation',
    label: 'Custom / Nav Menu Plus',
    icon: ComponentIcon.Navigation,
    props: {
        className: Style({
            properties: Style.All,
        }),
        headerBar: Slot(),
        logo: Group({
            label: 'Logo',
            props: {
                src: Image({
                    label: 'Image',
                    format: Image.Format.URL,
                }),
                alt: TextInput({
                    label: 'Alt Text',
                    defaultValue: 'Logo',
                }),
                width: Number({
                    label: 'Width',
                    defaultValue: 150,
                    step: 10,
                }),
                height: Number({
                    label: 'Height',
                    defaultValue: 50,
                    step: 10,
                }),
                className: Style({
                    properties: [Style.Width, Style.Margin],
                }),
            },
        }),
        links: List({
            label: 'Navigation Links',
            type: Group({
                label: 'Link',
                props: {
                    label: TextInput({
                        label: 'Link Text',
                        defaultValue: 'Link',
                    }),
                    link: Link({
                        label: 'URL',
                    }),
                    useTransition: Checkbox({
                        label: 'Enable Transition',
                        defaultValue: false,
                    }),
                    animationType: Select({
                        label: 'Animation Type',
                        options: [
                            { label: 'Actraiser Drop', value: 'ActraiserDrop' },
                            { label: 'Logo Splash', value: 'LogoSplash' },
                        ],
                        defaultValue: 'ActraiserDrop',
                    }),
                    transitionDuration: Number({
                        label: 'Duration (s)',
                        defaultValue: 1,
                        step: 0.1,
                    }),
                    rotationSpeed: Number({
                        label: 'Rotation (deg)',
                        defaultValue: 360,
                        step: 90,
                    }),
                    zoomScale: Number({
                        label: 'Zoom Scale',
                        defaultValue: 2,
                        step: 0.5,
                    }),
                    splashScale: Number({
                        label: 'Splash Zoom Scale',
                        defaultValue: 3,
                        step: 0.5,
                    }),
                    animatedPathId: TextInput({
                        label: "Paths to Animate (comma-separated IDs, 'all' or 'none')",
                        defaultValue: 'all',
                    }),
                    gradientStart: Color({
                        label: 'Gradient Start Color',
                        defaultValue: '#00ffff',
                    }),
                    gradientEnd: Color({
                        label: 'Gradient End Color',
                        defaultValue: '#ffd700',
                    }),
                    splashImage: Image({
                        label: 'Splash SVG',
                        description: 'Optional: select an SVG for LogoSplash transitions',
                        format: Image.Format.URL,
                    }),
                    strokeWidth: Number({
                        label: 'Stroke Width',
                        defaultValue: 3,
                        min: 1,
                        max: 10,
                        step: 0.5,
                    }),
                },
            }),
            getItemLabel: item => item?.label ?? 'Link',
        }),
    },
});

