import sys

from .rnn import BasicRNN
from .cnn import BasicCNN
from .cnn_lstm import CnnLSTM
# from .unet import UNet
# from .efficient_net import EfficientNet

def get_model_initializer(model_name):
    ''' Retrieves class initializer from its string name. '''
    return getattr(sys.modules[__name__], model_name)
