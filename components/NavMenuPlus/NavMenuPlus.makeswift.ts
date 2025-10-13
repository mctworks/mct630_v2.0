import { runtime } from '@/lib/makeswift/runtime';
import { lazy } from 'react';
import { 
  List, 
  Link, 
  TextInput, 
  Style, 
  Group, 
  Image,
  Slot,
  Number,
} from '@makeswift/runtime/controls';
import { ComponentIcon } from '@makeswift/runtime';
import NavMenuPlus from './NavMenuPlus';

runtime.registerComponent(NavMenuPlus as any,{
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
                    },
                }),
                getItemLabel: item => item?.label ?? 'Link',
            }),
        },
    },
);
